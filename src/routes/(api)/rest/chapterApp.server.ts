import { CustomError } from '$lib/queries/base/errors';
import { chapter_user_action } from '$lib/queries/chapter/chapter_user.server';
import {
	chapterCols,
	chapterColsExcludeContent,
	chapterColsWithUserInfo,
	ChapterFields,
	user_chapter_data_fields
} from '$lib/queries/chapter/fields';
import { removeNil } from '$lib/queries/util';
import { chapterSchema } from '$lib/schema';
import { chapter_user_data_update_schema } from '$lib/schema/chapterschema';
import {
	chapterSchemaGet,
	chapterSchema as paginate
} from '$lib/schema/querySchema/chapterSchema';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabase } from '$lib/supabaseClient/client';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import type {
	chapter,
	min_chapter,
	paginateQuery,
	user_chapter_data
} from '$lib/types';
import { stripHTML, WordCount } from '$lib/utils/fileUtils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';
import { isBookPermitted } from './bookApp.server';
import { verifyPreviewId } from './previewApp.server';
import { updateBookBasedOnChapter, updateDOStats } from './statsApp.sever';
import type { apiEnv } from './[...paths]/+server';
import { genID } from './utils/getUUID';
import { SITE_URL } from '$lib/data/constants';
import { CHAPTER_UPDATE_COUNTER_API_SECRET_TOKEN } from '$env/static/private';
import { getAlarmScheduleFnStub } from './utils/alarm';
import { actionToStatus, chapter_status } from '$lib/data/dbConstants';
import { ChapterPubEvent, push_user_event } from './utils/user_event';
import { DisposeRPC } from './utils/chat';
async function get(
	query: paginateQuery<chapter>,
	client: typeof supabase = supabase
) {
	let builder = client
		.from('chapters')
		.select(chapterColsExcludeContent)
		.range(query.paginate.start, query.paginate.end - 1)
		.order('sequence');
	if (query.filter) {
		if (query.filter.book_id) {
			builder.eq('book_id', query.filter.book_id);
		}
		if (query.filter.status) {
			builder.eq('status', query.filter.status);
		}
		if (query.filter.id) {
			builder.eq('id', query.filter.id);
		}
		if (typeof query.filter.sequence === 'number') {
			builder.gte('sequence', query.filter.sequence);
		}
	}
	const count = await builder;
	return count;
}
// base path /api/
export const chapterPrivate = new Hono<apiEnv>()
	.post(
		'/create',
		zValidator(
			'json',
			chapterSchema.pick({
				title: true,
				sequence: true,
				content: true,
				status: true,
				authors_words: true,
				book_id: true
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			console.log('test query', query, uid);
			query.author_id = uid;
			// check if book belong to user
			/* const is_users = await supabase  //TODO if we remove RLS then we need this
				.from('books')
				.select('author_id')
				.eq('id', query.book_id)
				.single();
			if (is_users.data?.author_id !== uid) {
				throw new CustomError('Unauthoried to create chapters');
			} */
			query.id = genID();
			const count = await supabaseServer()
				.from('chapters')
				.insert(query)
				.select(chapterColsExcludeContent)
				.single();
			if (count.error) {
				throw new CustomError(count.error.message);
			}

			return json(count.data as min_chapter);
		}
	)
	.get(
		'/content',
		zValidator('query', z.object({ id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user!.id;
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			if (!query.id) {
				return new Response('missing chapter id', { status: 400 });
			}
			let builder = await supabase
				.from('chapters')
				.select(chapterCols)
				.eq('id', query.id)
				.eq('author_id', uid)
				.single();
			if (builder.error) {
				return json(builder.error, 400);
			}
			return json(builder.data);
		}
	)
	.get(
		'/getChapterList',
		zValidator(
			'query',
			z.object({
				book_id: z.string(),
				preview_id: z.string().nullable().optional()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('query');

			// requires 3 query
			const cacheK = new Request(req.url);
			const uid = requestHandler.locals.user?.id;
			if (!uid)
				throw new Error('missing user id in get chapter list protected');
			/* 	const cache = await requestHandler.platform?.caches.default.match(cacheK);
			if (cache) {
				const r = await cache.json();
				return json(r as Root);
			} */

			const sql = requestHandler.locals.sql();
			let count = await sql<min_chapter[]>`
				select ${sql(chapterColsExcludeContent.split(','))}  -- bypass row return limit imposed  
				from chapters
				where book_id = ${query.book_id} and author_id =${uid}
			`;
			//	const count = await builder;
			// requires 3 query
			const res = count as unknown as min_chapter[];

			return json(res);
		}
	)
	.delete(
		'/delete',
		zValidator('json', z.object({ id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const count = await supabaseServer()
				.from('previews')
				.delete()
				.match({ ...query, user_id: requestHandler!.locals!.user.id })
				.single();
			if (count.error) {
				return json(count.error, count.status);
			}
			return new Response(JSON.stringify(count));
		}
	)
	.post(
		'/update_user_info',
		zValidator(
			'json',
			chapter_user_data_update_schema.merge(
				z.object({
					prev_is_like: z
						.boolean()
						.nullish()
						.transform((v) => (typeof v === 'boolean' ? v : null))
				})
			)
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			let table = 'chapters' as const;
			let prev = { is_like: query.prev_is_like };
			const inf = await requestHandler.platform?.env.do_statsCounter;
			let user_info = await requestHandler.locals.supabase
				.from('user_chapter_data')
				.upsert(
					{
						is_like: query.is_like,
						bookmark_notes: query.bookmark_notes ?? '',
						is_bookmark: query.is_bookmark ?? false,
						book_id: query.book_id,
						chapter_id: query.chapter_id,
						user_id: uid
					},
					{ onConflict: 'user_id,chapter_id' }
				)
				.eq('user_id', uid)
				.eq('chapter_id', query.chapter_id)
				.select('*')
				.single();
			// update DO
			if (user_info.error) {
				throw new CustomError(user_info.error.message);
			}

			async function main() {
				console.log('fetch prev user info', prev.is_like, query);
				if (prev?.is_like !== query.is_like && query.is_like !== undefined)
					await updateDOStats({
						id: query.chapter_id,
						curr_is_like: query.is_like,
						prev_is_like: query.prev_is_like ?? null, //FIXME should not trust user input, check in update? no because if update 1 failed, update 2 might faield too
						do_statsCounter: requestHandler.platform!.env.do_statsCounter,
						table: table
					});
			}
			requestHandler.platform.context.waitUntil(main());

			return json(user_info.data as user_chapter_data);
		}
	)
	.post(
		'/bookmark_notes',
		zValidator('json', paginate.omit({ filter: true })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('json');
			const cacheKey = new Request(req.url);
			const uid = requestHandler.locals.user!.id;
			let builder = supabase
				.from('user_chapter_data')
				.select(
					user_chapter_data_fields +
						`,chapters!inner(${chapterColsExcludeContent}),books!inner(title)`
				)
				.eq('user_id', uid)
				.match({ is_bookmark: true })
				.range(query.paginate.start, query.paginate.end - 1);

			if (query.paginate.orderWithMultiple)
				for (let col in query.paginate.orderWithMultiple) {
					builder = builder.order(
						'updated_at',

						{ asc: query.paginate.orderWithMultiple[col]?.asc }
					);
				}
			if (query.search?.regex) {
				builder = builder.ilike(
					'bookmark_notes',
					'%' + query.search?.regex + '%'
				);
			}

			const data = await builder;
			if (data.error) throw data.error;
			return json(data.data as unknown as user_chapter_data[]);
		}
	)
	.get(
		'/get_public_chapter',
		zValidator('query', z.object({ chapter_id: z.string() })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			const sql = requestHandler.locals.sql();
			let builder = await sql<chapter[]>`
				select ${sql(ChapterFields)}
			
			`;

			const count = await builder;
			if (count.error) {
				return json(count.error, 400);
			}
			return json(count.data);
		}
	)
	.post(
		'/bookmark/count',
		zValidator('json', paginate),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			let builder = supabase
				.from('user_chapter_data')
				.select(
					user_chapter_data_fields +
						`,chapters!inner(${chapterColsExcludeContent}),books!inner(title)`,
					{ head: true, count: 'estimated' }
				)
				.eq('user_id', uid)
				.match({ is_bookmark: true })
				.range(query.paginate.start, query.paginate.end - 1);

			if (query.search?.regex) {
				builder = builder.ilike(
					'bookmark_notes',
					'%' + query.search?.regex + '%'
				);
			}

			const data = await builder;
			if (data.error) throw data.error;
			return json(data.count);
		}
	)
	.get(
		'/user_data',
		zValidator('query', z.object({ chapter_id: z.string() })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			const { data, error } = await supabase
				.from('user_chapter_data')
				.select(user_chapter_data_fields)
				.eq('chapter_id', query.chapter_id)
				.eq('user_id', uid)
				.maybeSingle();
			if (error) throw error;
			return json(data);
		}
	)
	.post(
		'/update',
		zValidator(
			'json',
			chapterSchema.partial().merge(
				z.object({
					id: BigIntIdsZod,
					book_id: BigIntIdsZod,
					lang: z.string(),
					secret: z.string().nullish()
				})
			)
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			console.log('test query', query, uid);
			const html = stripHTML(query.content ?? '');
			const wc = WordCount(html, query.lang ?? 'English');
			const supabase = requestHandler.locals.supabase;
			const data = query.content; //TODO add chapter_id here ?
			const fields = {
				title: query.title,
				sequence: query.sequence,
				content: typeof query.content == 'string' ? data : undefined,
				authors_words: query.authors_words,
				status: query.status,
				user_modified_at: new Date().toUTCString(),
				word_count: wc ?? html.length,
				character_count: html.length
			} as const;
			// update char count
			removeNil(fields);
			// remove undefined fields
			console.log('start updating', fields);
			// update book near real-time
			// queue
			// select for update
			// durable objects
			// cron
			// FrontEnd send it
			let old_chapters = await supabaseServer()
				.from('chapters')
				.select('word_count,status,author_id')
				.eq('id', query.id)
				.single();
			console.log('old chapter', old_chapters);
			if (old_chapters.error) {
				throw new CustomError(
					old_chapters.error.message,
					'failed to get old chapter'
				);
			}
			const info = await supabase
				.from('chapters')
				.update(fields)
				.match({ id: query.id, author_id: uid, book_id: query.book_id })
				.select(
					'book_id,status,id,user_modified_at,title,word_count,character_count,author_id'
				)
				.single();
			if (info.error) throw info.error;
			const platform = requestHandler.platform;
			await ChapterPubEvent({
				requestHandler,
				old_chapter: old_chapters.data,
				new_chapter: info.data
			});
			if (
				query.status === 'published' &&
				old_chapters.data.status !== 'published'
			) {
				platform.context.waitUntil(
					updateBookBasedOnChapter({
						id: query.book_id,
						sql: requestHandler.locals.sql()
					})
				);
				// keep number of character written
			}
			//
			return json(info.data as min_chapter);
		}
	)
	.post(
		'/schedule',
		zValidator(
			'json',
			z.object({
				chapter_id: BigIntIdsZod,
				time: z.number()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			// make sure chapter belong to author ?
			const book = await supabase
				.from('chapters')
				.update({
					scheduled_publish_date: new Date(query.time).toISOString(),
					status: actionToStatus['schedule']
				})
				.eq('id', query.chapter_id)
				.eq('author_id', uid)
				.select('author_id,status')
				.single();
			if (book.error || book.data?.author_id !== uid) {
				console.log(uid, book);
				throw new CustomError('Unauthorized');
			}
			const stub = getAlarmScheduleFnStub({
				name_arg: {
					type: 'chapter_scheduled_publish',
					unique_id: query.chapter_id
				},
				requestHandler: requestHandler
			});
			let data = await stub.scheduledPublish({
				time: query.time,
				httpCalls: {
					link: SITE_URL + 'rest/api/chapters/scheduled_update_status',
					method: 'POST',
					body: JSON.stringify({
						secret: CHAPTER_UPDATE_COUNTER_API_SECRET_TOKEN,
						chapter_id: query.chapter_id
					}),
					retry: 3
				}
			});
			await DisposeRPC(data);
			return json({ message: 'updated' });
		}
	)
	.post(
		'/unschedule',
		zValidator('json', z.object({ chapter_id: BigIntIdsZod })),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const book = await supabase
				.from('chapters')
				.select('author_id,status')
				.eq('id', query.chapter_id)
				.eq('author_id', uid)
				.single();
			if (book.error) {
				throw book.error;
			}
			const stub = getAlarmScheduleFnStub({
				name_arg: {
					type: 'chapter_scheduled_publish',
					unique_id: query.chapter_id
				},
				requestHandler: requestHandler
			});
			await stub.deleteScheduledPublish();
			return json({ message: 'unscheduled' });
		}
	);

export const chapterApi = new Hono()
	/* .get(
		'/getLastChapter',
		zValidator('query', z.object({ book_id: z.string() })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			let builder = supabase
				.from('chapters')
				.select(chapterColsExcludeContent)
				.eq('book_id', query.book_id)
				.eq('status', 'published')
				.order('sequence', { ascending: false })
				.limit(1)
				.single();

			const count = await builder;
			if (count.error) {
				return json(count.error, 400);
			}
			return json(count.data);
		}
	)*/
	.get(
		'/pagination',
		zValidator('query', chapterSchemaGet),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			const cacheKey = new Request(req.url);

			const count = await get(query, supabase);
			if (count.error) {
				return json(count.error, 500);
			}

			return json(count.data);
		}
	)
	/* 	.get(
		'/getFirstChapter',
		zValidator('query', z.object({ book_id: z.string() })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			let builder = supabase
				.from('chapters')
				.select(chapterColsExcludeContent)
				.eq('book_id', query.book_id)
				.eq('status', 'published')
				.order('sequence')
				.limit(1)
				.single();
			const count = await builder;
			if (count.error) {
				return json(count.error, 400);
			}
			return json(count.data);
		}
	) */
	.get(
		'/getChapterList',
		zValidator(
			'query',
			z.object({
				book_id: z.string(),
				preview_id: z.string().nullable().optional()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			console.log(query);
			const uid = requestHandler.locals.user_id;
			// requires 3 query
			const cacheK = new Request(req.url);
			const book = await isBookPermitted({
				user_id: uid,
				kv_cache: requestHandler.platform!.env.kv_cache,
				book_id: query.book_id
			});
			const sql = sqlInstance();
			let ret: Awaited<ReturnType<typeof verifyPreviewId>> | null = null;
			if (query.preview_id) {
				ret = await verifyPreviewId({
					book_id: query.book_id,
					preview_id: query.preview_id,
					chapter_id: null
				}).catch((v) => {
					console.error(v);
					return false;
				});
				console.log('result preview', ret);
			}
			let builder = await sql`
				select title,sequence,id,book_id,user_modified_at,created_at,like_count,dislike_count,status  -- bypass row return limit imposed  
				from chapters
				where  ${
					!ret
						? uid
							? sql`(status = 'published' or author_id = ${uid}) and`
							: sql`(status = 'published') and`
						: sql``
				} book_id = ${query.book_id} -- don't need to order by since we do it client side
				${ret && ret.isSingleChapter ? sql`and (status = 'published' or id = ${ret.chapter_id})` : sql``}
				;
			`.execute();
			console.log('chapter list', builder[0]);
			const res = builder as unknown as min_chapter[];
			//const grouper = groupChapters(res);
			async function put() {
				requestHandler.platform?.caches.default.put(
					cacheK,
					new Response(JSON.stringify(res), {
						status: 200,
						headers: { 'cache-control': 's-max-age=200' }
					})
				);
			}
			//executionCtx.waitUntil(put());
			return json(res);
		}
	)
	.get(
		'/chapter',
		zValidator(
			'query',
			z.object({
				id: BigIntIdsZod,
				preview_id: z.string().optional(),
				book_id: BigIntIdsZod
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('query');
			const uid = requestHandler.locals.user_id;
			const cacheKey = new Request(req.url);
			await isBookPermitted({
				//TODO need to cache the result
				...query,
				kv_cache: requestHandler.platform!.env.kv_cache,
				user_id: uid
			}); //
			if (query.preview_id) {
				let data = await verifyPreviewId({ ...query });
				const info = await supabaseServer()
					.from('chapters')
					.select(chapterColsWithUserInfo)
					.match(query)
					.maybeSingle();
				return json(info.data);
			}

			const info = await supabaseServer()
				.from('chapters')
				.select(chapterColsWithUserInfo)
				.match(query)
				.eq('status', 'published')
				.maybeSingle();
			if (info.error) throw info.error;
			return json(info.data);
		}
	)
	.get(
		'/recent_created_chapters/:author_id',
		zValidator('param', z.object({ author_id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const id = req.valid('param');
			const uid = requestHandler.locals.user_id;
			const info = await supabaseServer()
				.from('chapters')
				.select(chapterColsWithUserInfo)
				.eq('status', 'published')
				.eq('author_id', id.author_id)
				.order('user_modified_at', { ascending: false })
				.limit(3);
			if (info.error) throw info.error;
			return json(info.data);
		}
	)
	.post(
		'/scheduled_update_status',
		zValidator(
			'json',
			z.object({
				secret: z.string(),
				chapter_id: BigIntIdsZod
			})
		),
		async ({ req, json }) => {
			const query = req.valid('json');
			if (query.secret !== CHAPTER_UPDATE_COUNTER_API_SECRET_TOKEN) {
				throw new CustomError('Invalid Call');
			}
			const count = await supabaseServer()
				.from('chapters')
				.update({ status: 'published' })
				.eq('id', query.chapter_id);
			if (count.error) {
				return json(count.error, 500);
			}
			return json(count.data);
		}
	);

export const chapterApp = new Hono()
	.route('/protected', chapterPrivate)
	.route('/', chapterApi)
	.onError((v, c) => {
		console.log(v);
		return c.json(
			{ message: v.message },
			{
				status: 500
			}
		);
	});
