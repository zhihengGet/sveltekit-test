import * as z from 'zod';

// As JavaScript object
import { COMMENT_EMAIL_THROTTLER, SITE_URL } from '$lib/data/constants';
import { CustomError } from '$lib/queries/base/errors';
import {
	getCommentCount,
	getComments,
	getUserComments
} from '$lib/queries/comment/comment.server';
import {
	comment_field,
	comment_with_user,
	fields,
	user_comment_data_fields
} from '$lib/queries/comment/fields';
import { user_comment_actions } from '$lib/queries/comment/user_comment.server';
import { getPublicAvatarUrlSync } from '$lib/queries/storage/ObjectKey';
import {
	comment_schema,
	comment_schema_create
} from '$lib/schema/commentSchema';
import { commentPaginate } from '$lib/schema/querySchema/commentSchema';
import { BigIntIdsZod, page } from '$lib/schema/querySchema/zodPagination';
import { supabase } from '$lib/supabaseClient/client';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import type { comment, commentJoined, user_comment_data } from '$lib/types';
import { zValidator } from '@hono/zod-validator';
import { isAfter, isBefore } from 'date-fns';
import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { getBookConfig } from './bookApp.server';
import { verifyPreviewId } from './previewApp.server';
import { sendNotifyOnReviewEmail } from './sendEmail.server';
import { updateDOStats } from './statsApp.sever';
import { throttler } from './utils/event';
import { DO_GEN } from './utils/kv';
import { genID } from './utils/getUUID';

export const commentRequestSchema = z.object({
	type: z.string().refine((type) => type === 'comment_count'),
	section_ids: z.array(z.string()).transform((v) => {
		if (typeof v === 'string') {
			try {
				return JSON.parse(v).map((v) => v + '');
			} catch (error) {
				// Handle parsing errors (e.g., log, throw, return default value)
				return [];
			}
		}
		return [];
	}),
	chapter_id: BigIntIdsZod // Assuming BigIntIdsZod is a custom Zod schema
});
// base path /api/
export const commentAppPublic = new Hono<apiEnv>();

// base path /api/
export const commentAppProtected = new Hono<apiEnv>()
	.post(
		'/count',
		zValidator('json', commentRequestSchema),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const sql = sqlInstance();
			const count = await sql<{ section_id: string; count: string }[]>`
            select section_id, count(id) from public.comments where chapter_id=${query.chapter_id} and (section_id in ${sql(query.section_ids)} or section_id is null) group by section_id
        `.execute();
			console.log('counter', count);
			return json(count);
		}
	)
	.post(
		'/create',
		zValidator('json', comment_schema_create),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const sql = sqlInstance();
			const uid = requestHandler.locals.user_id;
			const profiles = await supabase
				.from('profiles')
				.select('username')
				.eq('id', uid)
				.single();
			if (profiles.error) {
				throw new CustomError('User does not exists! Failed to create comment');
			}
			const temp: Omit<
				comment,
				'id' | 'created_at' | 'updated_at' | 'has_unread_child'
			> = {
				chapter_id: query.chapter_id,
				section_id: query.section_id,
				user_id: uid,
				parent_id: query.parent_id ?? null,
				content: query.content,
				username: profiles.data.username,
				avatar_url: await getPublicAvatarUrlSync({ uid: uid }),
				language: 'en', //TODO
				book_id: query.book_id,
				is_visible: false,
				dislike_count: 0,
				like_count: 0,
				type: query.type,
				id: genID(),
				tags: query.tags
			};

			const info = await supabase
				.from('comments')
				.insert(temp)
				.select(`${fields},user_comment_data(${user_comment_data_fields})`)
				.single();

			console.log('create  comment', info);
			if (info.error) throw info.error;
			async function notify() {
				const config = await getBookConfig(
					requestHandler!.platform,
					temp.book_id
				);
				let author_book = await sqlInstance()`
				select title,books.created_at,email,author_id
				from books
				inner join auth.users on auth.users.id=books.author_id
				where books.id=${temp.book_id}`;
				console.log('book author ', author_book);
				let is_allowed = info.data?.parent_id === null;
				let book_author_info = author_book[0];
				if (author_book[0]?.is_visible === false) {
					return console.log('book invisible');
				}
				if (!book_author_info) {
					return console.log('Failed to fetch author info for this comment');
				}
				const parent_comment = info.data?.parent_id
					? await supabase
							.from('comments')
							.select('user_id')
							.eq('id', info!.data.parent_id)
							.single()
					: null;
				console.log('parent_comment', parent_comment);
				if (info.data!.parent_id !== null) {
					if (config.notifyOnUserCommentReply) {
						if (
							parent_comment?.data?.user_id === author_book?.[0]?.author_id &&
							temp.user_id !== uid
						) {
							// THE COMMENT replied to is the comment written by author
							is_allowed = true; //TODO throttle?
						}
					} else console.log('not top level comment & disabled notification');
				}
				if (
					book_author_info.author_id === uid &&
					temp.parent_id !== null &&
					parent_comment?.data?.user_id !== uid
				) {
					// author is replying to antoher person
					// no throttler bc only one person (author)
					console.log('sending email to user since author replied');
					await sendNotifyOnReviewEmail({
						to: author_book[0]!.email,
						subject: 'Author replied to your comment ' + book_author_info.title,
						html: `Author of the book *${book_author_info.title}* replied to your comment.	<a
							href="/reader/${temp.book_id}/${info.data?.chapter_id}?section=${encodeURI(
								temp.section_id
							)}&parent=${0}&comment_id=${info.data?.id}"
					target="_blank"
						>
					Click here to view comment
						</a>; To stop receiving emails, disable it through book settings🚧`
					});
				}
				// notify author about replies or first level comments
				// throttle bc multiple user can try to notify
				if (
					is_allowed ||
					(info.data?.parent_id === null &&
						isBefore(new Date(), config.notifyOnReview) &&
						info.data.user_id !== uid)
				) {
					console.log('start check if author should get email');
					const shouldUpdateBook = await throttler({
						name: DO_GEN.EVENT_COMMENT_THROTTLER_NAME(temp.chapter_id),
						gap: COMMENT_EMAIL_THROTTLER,
						platform: requestHandler.platform,
						reason: 'comment-email-event'
					});
					if (!shouldUpdateBook)
						return console.log(
							'Only email author every 5 hour about new reviews'
						);

					const author_email =
						author_book ??
						(await sqlInstance()`
						select title,books.created_at,email
						from books
						inner join auth.users on auth.users.id=books.author_id
						where books.id=${temp.book_id}
					`);
					const book = author_email?.[0];
					if (
						book &&
						book.title &&
						!isAfter(new Date(), config.notifyOnReview ?? new Date('1999')) // 1 year range
					) {
						await sendNotifyOnReviewEmail({
							subject: 'A coment was left on your book!',
							to: book!.email,
							html: `A reader just wrote a comment for your book *${book.title}* 	<a
						href="${SITE_URL}/reader/${temp.book_id}/${info.data?.chapter_id}?section=${encodeURI(
							temp.section_id
						)}&parent=${0}&comment_id=${info.data?.id}"
						target="_blank"
					>
						Click here to view comment
					</a>; To stop receiving emails, disable it through book settings🚧`
						});
					}
				}
			}

			requestHandler.platform?.context.waitUntil(notify());
			return json(info.data);
		}
	)
	.get(
		'/user_comments/count',
		zValidator('query', z.object({ user_id: z.string() }).partial()),
		async ({ req, env, var: { requestHandler }, json }) => {
			const query = req.valid('query');
			const uid = requestHandler.locals.user_id;
			const data = await getCommentCount(query.user_id);
			return json(data);
		}
	)
	.post(
		'/user_comments',
		zValidator('json', commentPaginate),
		async ({ req, env, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const data = await getUserComments(query);
			if (query.filter.user_id !== uid || !uid) {
				//TODO cache
				return json(data);
			}
			return json(data);
		}
	)
	.post(
		'/comments',
		zValidator('json', commentPaginate),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			//const uid = requestHandler.locals.user_id;
			// only get comments of published chapter unless..
			const status = await supabaseServer()
				.from('chapters')
				.select('status,author_id')
				.eq('id', query.filter.chapter_id)
				.single();

			if (status.error) {
				throw new CustomError(status.error.message);
			}
			if (
				status.data.status !== 'published' &&
				status.data.author_id !== requestHandler.locals.user_id
			) {
				//check user have permission , previewURL
				if (!query.filter.preview_session)
					throw new Error(
						'You are not allowed to see comments for this chapter;'
					);
				const a = await verifyPreviewId({
					preview_id: query.filter.preview_session,
					chapter_id: query.filter.chapter_id,
					book_id: query.filter.book_id
				});
				//if (!a) throw new Error('Failed to verify preview ', { cause: a });
			}

			const data = await getComments(query);
			/* if (query.filter.user_id !== uid || !uid) {
				// cache
				return new Response(JSON.stringify(data), {
					headers: {
						'cache-control': 'max-age=120'
					}
				});
			} */
			return json(data as commentJoined[]);
		}
	)
	.get(
		'/hasunread',
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const data = await requestHandler.locals.supabase
				.from('comments')
				.select('id', { head: true, count: 'exact' })
				.eq('has_unread_child', true)
				.eq('user_id', uid);
			if (data.error) {
				throw new Error(data.error.message);
			}
			return json(data.count);
		}
	)
	.get(
		'/comment',
		zValidator('query', z.object({ id: z.string() })),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			const data = await requestHandler.locals.supabase
				.from('comments')
				.select(comment_with_user)
				.eq('id', query.id)
				.single();
			if (data.error) {
				throw new Error(data.error.message);
			}
			return json(data.data as commentJoined);
		}
	)
	.get(
		'/user_comment',
		zValidator(
			'query',
			z
				.object({
					section_id: z.string(),
					book_id: z.string(),
					chapter_id: z.string(),
					parent_id: z.string().nullish()
				})
				.passthrough()
				.partial()
				.transform((v) => {
					v.parent_id =
						v.parent_id == 'null' || !v.parent_id ? null : v.parent_id;
					return v;
				})
		),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			let sup = supabase
				.from('comments')
				.select(`${fields},user_comment_data(${user_comment_data_fields})`)
				.match({
					chapter_id: query.chapter_id,
					section_id: query.section_id,
					user_id: uid
				});
			if (query.parent_id == null)
				sup = sup.filter('parent_id', 'is', query.parent_id);
			else sup = sup.eq('parent_id', query.parent_id);

			const info = await sup.limit(1).maybeSingle();

			console.log('get user comment', query, info);
			if (info.error) throw new Error(info.error.message);

			return json(info.data as commentJoined | null);
		}
	)
	.post(
		'/update_user_info',
		zValidator(
			'json',
			z.object({
				id: BigIntIdsZod, // book id, review, chapter id
				is_like: z.boolean().nullable(),
				prev_is_like: z
					.boolean()
					.nullish()
					.transform((v) => (typeof v === 'boolean' ? v : null))
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const prev = { is_like: query.prev_is_like || null };
			const sql = sqlInstance();
			type re = { old_is_like: null; new_is_like: false };
			const s = await sql<re[]>`
				WITH old_status AS (
					SELECT
						is_like AS is_like
					FROM
						user_comment_data
					WHERE
						comment_id = ${query.id} and user_id =${uid}
					FOR UPDATE
				),
				new_status as (INSERT into user_comment_data
				${sql({ user_id: uid, comment_id: query.id, is_like: query.is_like })}
				on conflict (user_id, comment_id) do
				UPDATE
				SET
					is_like = ${query.is_like}
				)
				select
				 is_like AS old_is_like from old_status;
			`;
			prev.is_like = s[0]?.old_is_like;
			/* const user = await supabaseServer()
				.from('user_comment_data')
				.upsert(
					{
						user_id: uid,
						comment_id: query.id,
						is_like: query.is_like
					},
					{ onConflict: 'comment_id,user_id' }
				)
				.eq('comment_id', query.id)
				.eq('user_id', uid)
				.select('*')
				.single(); */

			console.log('fetch prev user info', query);
			let table = 'comments' as const;
			//if (user.error) throw new CustomError(user.error.message);
			// update DO
			await updateDOStats({
				...query,
				curr_is_like: query.is_like,
				prev_is_like: prev.is_like,
				do_statsCounter: requestHandler.platform!.env.do_statsCounter,
				table: table
			});
			return json({
				comment_id: query.id,
				user_id: uid,
				is_like: query.is_like,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			} as user_comment_data);
		}
	)
	.post(
		'/create_user_info',
		zValidator(
			'json',
			z.object({
				id: BigIntIdsZod, // book id, review, chapter id
				is_like: z.boolean().nullable()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			// update user info
			// tell DO what to update
			// return user info
			const prev = { data: { is_like: null } };
			console.log('fetch prev user info', prev.data);
			// create user
			const user_info = await user_comment_actions.create({
				is_like: query.is_like,
				comment_id: query.id
			});
			// update DO
			await updateDOStats({
				...query,
				curr_is_like: query.is_like,
				prev_is_like: null,
				do_statsCounter: requestHandler.platform!.env.do_statsCounter,
				table: 'comments'
			});
			return json(user_info as user_comment_data);
		}
	)
	.post(
		'/book_comments',
		zValidator('json', commentPaginate.pick({ filter: true, paginate: true })),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			//TODO check if book belongs to user
			const data = supabase
				.from('comments')
				.select(`${fields},user_comment_data(${user_comment_data_fields})`)
				.match(query.filter)
				.range(query.paginate.start, query.paginate.end - 1);

			if (query.filter.tags) {
				data.contains('tags', query.filter.tags);
			}
			if (query.paginate.orderWithMultiple) {
				for (let x in query.paginate.orderWithMultiple) {
					data.order(x, {
						ascending: query.paginate.orderWithMultiple[x]?.asc ?? true
					});
				}
			}
			const r = await data;
			if (r.error) throw r.error;
			return json(r.data);
		}
	)
	.post(
		'/update',
		zValidator('json', comment_schema),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const temp: Partial<comment> = {
				user_id: uid,
				id: query.id
			};
			const info = await supabase
				.from('comments')
				.update({
					content: query.content,
					username: query.username, // RLS
					user_modified_at: new Date().toUTCString(),
					tags: query.tags
				})
				.match(temp)
				.select(comment_field)
				.single();

			console.log('update  comment', info.data, info);
			if (info.error) throw info.error;

			return json(info.data as comment);
		}
	)
	.delete(
		'/delete_comment',
		zValidator('query', z.object({ comment_id: BigIntIdsZod })),
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const param = req.valid('query');
			const query = await supabase
				.from('comments')
				.delete()
				.match({ id: param.comment_id, user_id: uid })
				.single();
			if (query.error) throw query.error;
			return json(0);
		}
	)
	.post(
		'/mark_read',
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const data = await supabase
				.from('comments')
				.update({ has_unread_child: false })
				.match({ user_id: uid, has_unread_child: true });

			if (data.error) throw data.error;

			return json(200);
		}
	);

export const commentApp = new Hono<apiEnv>()
	.route('/protected', commentAppProtected)
	.route('/', commentAppPublic)
	.onError((v, { json }) => {
		return json({ message: v.message }, 400);
	});
