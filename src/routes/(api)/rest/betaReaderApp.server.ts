// As JavaScript object
import { Hono } from 'hono';
//import type { apiEnv } from './[...paths]/+server';
import {
	DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY,
	MAX_INVITATION_SENT_PER_AUTHOR,
	SITE_URL
} from '$lib/data/constants';
import { CustomError } from '$lib/queries/base/errors';
import {
	generateViewURL,
	getPreviewSessionIdAsync
} from '$lib/queries/preview/usePreview';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import { zValidator } from '@hono/zod-validator';
import { groupBy, uniq, uniqBy } from 'lodash-es';
import z, { number } from 'zod';
import { verifyPreviewId } from './previewApp.server';
import { batchSendBetaReadMail } from './sendEmail.server';
import { sleep } from '$lib/utils/sleep';
import { EMAIL_COUNTER_API_SECRET_TOKEN } from '$env/static/private';
import type { storage } from '../../../../../../packages/reviewer-counter/src/index';
const MAX_READER = MAX_INVITATION_SENT_PER_AUTHOR;

export const KV_BETA_KEYS = (uid: string) => 'BETA_READERS_' + uid;
type KV_BETA_READER_EMAILED_COUNT = { user_ids: string[] };
export const urlProtected = new Hono()
	.post(
		'/request',
		zValidator('json', z.object({ book_id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			const supabase = await supabaseServer()
				.from('user_book_data')
				.update({
					is_beta_reader: true
				})
				.eq('book_id', query.book_id)
				.eq('user_id', uid);
			if (supabase.error) throw new Error(supabase.error.message);

			return json({}, 200);
		}
	)
	.post(
		'/email',
		zValidator(
			'json',
			z.object({
				ids: z.array(z.string().uuid()).max(20).or(z.array(z.string()).max(20)),
				book_id: BigIntIdsZod,
				url: z.string().startsWith(SITE_URL).optional(),
				words: z.string().max(300).optional(),
				preview_id: z.string().optional(),
				chapter_id: z.string().nullish()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user!.id;
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('json');
			const key = KV_BETA_KEYS(uid);
			const DAYSEC = 3600 * 24;
			const kv = await requestHandler.platform?.env.kv_cache.get(key); //FIXME would fail at concurrent request , same user logged in, supabase has limits on session in PRO
			let kv_data = JSON.parse(
				kv ??
					JSON.stringify({
						user_ids: [],
						created: Date.now(),
						expiredAt: Math.ceil(Date.now() / 1000) + DAYSEC
					})
			) as {
				user_ids: string[];
				created: number;
				expiredAt?: number;
			};

			// check if user already sent 20 books
			if (kv) {
				kv_data.expiredAt =
					kv_data.expiredAt ?? Math.ceil(Date.now() / 1000) + DAYSEC;
				const ids = kv_data;
				let new_ids = ids.user_ids.concat(query.ids);
				console.log('ids', ids, new_ids);
				let diff = MAX_READER - new_ids.length;
				if (!import.meta.env.DEV && diff <= 0)
					throw new CustomError(
						'You have reached a limit for sending mail! Please wait one day to send again!',
						'You reached emailing limits  ! invitation emails today! Please wait one day to send again!',
						{ status: 429 }
					);
			}
			// verify book belongs to user
			const book = await requestHandler.locals.supabase
				.from('books')
				.select('title,author_id,cover_url,summary,author_name')
				.eq('id', query.book_id)
				.eq('author_id', uid)
				.single();

			if (book.error) {
				throw new Error(book.error.message);
			}

			// verify preview matches book & not expired
			let url = generateViewURL(query).toString();
			console.log('after gen');
			// make sure preview url belong to this book
			if (query.preview_id) {
				const temp = await verifyPreviewId(query);
				url = temp.url;
				if (temp.preview.user_id !== uid) {
					// preview id does not == author
					throw new CustomError('Invalid Preview Id');
				}
			}
			let uniqueQueryId = uniqBy(query.ids, (v) => v);
			// make sure these users allow emails from this book
			const res = await supabaseServer()
				.from('profiles')
				.select(
					'id,username, is_beta_reader,user_book_data(user_id,book_id,is_beta_reader)'
				)
				.eq('user_book_data.book_id', query.book_id)
				.in('id', uniqueQueryId);

			console.log('ids', res.data, query);
			// filtered ids
			const validProfiles =
				res.data?.filter(
					(v) =>
						(v.is_beta_reader === true &&
							v.user_book_data?.[0]?.is_beta_reader !== false) ||
						v.user_book_data?.[0]?.is_beta_reader
				) ?? [];

			const validUserIds = validProfiles.map((v) => v.id);
			console.log('filter ids', validUserIds);
			if (validUserIds.length == 0) {
				throw new Error(
					'Unable to email any of the users because they all denied beta reading for this book either globally or at the book level'
				);
			}
			// make sure these ids allow

			//const kv_previews = requestHandler.platform!.env.KV_PREVIEWS;

			requestHandler.locals.posthog.capture({
				distinctId: query.book_id + url,
				properties: {
					ids: validUserIds,
					book: query.book_id,
					title: book.data.title,
					author: uid
				},
				event: 'beta_readers_emailed'
			});
			const sql = requestHandler.locals.sql();

			if (query.preview_id) {
				console.log('update user list in preview table', url);
				const preview_id = await getPreviewSessionIdAsync(url);
				if (preview_id && preview_id.id) {
					const old_ids =
						await sql`select user_ids from previews where id = ${preview_id.id}`;
					console.log('old_ids', old_ids);
					const cleaned_ids = uniq(
						(old_ids?.[0]?.user_ids ?? []).concat(validUserIds)
					) as string[];
					console.log('cleaned no duplicate user ids', cleaned_ids);
					const update = await sql`
						update previews set user_ids = ${cleaned_ids}
						where id = ${preview_id.id};		
						`;
				}
			}

			const users = await supabase
				.from('user_global_configs')
				.select('*')
				.in('user_id', validUserIds);
			const user = groupBy(users.data, (v) => v.user_id);
			const profilesGroup = groupBy(validProfiles, (v) => v.id);
			const valid: string[] = [];
			const invalid_user_ids = [];
			// do a user level throttle, make sure each user only receive 1 email per minutes max, no concurrent emailing

			for (let x of validUserIds) {
				console.log('start validating id with durable objects');
				// validate if user exceeds max review invitation per day wit durable objects
				const id = requestHandler.platform?.env.do_EmailCounter.idFromName(x);
				if (!id) throw new Error('failed to get id when validating user id');
				const stub = requestHandler.platform?.env.do_EmailCounter.get(id);
				if (!stub)
					throw new Error('failed to get stub when validating user id');
				console.log('found stub', user[x]?.[0]);
				const res = await stub.fetch('https:///www.ANY.com', {
					body: JSON.stringify({
						max_author_invitation_per_day:
							user[x]?.[0]?.max_author_invitation_per_day ?? MAX_READER,
						//	current_emailed_count: null,
						user_id: x,
						secret_key: EMAIL_COUNTER_API_SECRET_TOKEN,
						http: new URL(
							'rest/api/betareader/refresh_invitation_count/?key=' +
								EMAIL_COUNTER_API_SECRET_TOKEN,
							SITE_URL
						).toString()
					} as Partial<storage>),
					method: 'post'
				});
				const r = (await res.json()) as {
					canEmail: boolean;
					current_count: number;
				};
				console.log('checking...', r);
				if (res.status == 200 && r?.canEmail) {
					valid.push(x);
				} else {
					invalid_user_ids.push(
						'Unable to email this user due to user setting'
					);
				}
			}

			console.log('after do cleanup', valid, validProfiles.length);
			// get emails
			const emails = await sql<{ id: string; email: string }[]>`
				select id, email from auth.users 
				where id in ${requestHandler.locals.sql()(valid)}
				limit ${MAX_READER}
				`;
			//? update kv meta data so that it can be used later on for statistics
			console.log('final emails', emails);
			async function resetKV() {
				//FIXME assuming user not logged in concurrently and email , if they do then they can email up to num_of_concurrent_login*20 , we can solve it by going pro in supabase which you can limit user login session
				await sleep(600); // sleep one second kv has limit write/s
				//console.log('updating kv', valid, kv_data);
				const DAY = 3600000 * 24;
				const expirationTtl = Math.trunc(
					(kv_data.created + DAY - Date.now()) / 1000
				);
				console.log(
					'expire in ',
					expirationTtl,
					expirationTtl / 60,
					expirationTtl / 60 / 60,
					kv_data.expiredAt
				);
				await requestHandler.platform?.env.kv_cache.put(
					key,
					JSON.stringify({
						...kv_data,
						user_ids: valid.concat(kv_data.user_ids)
					}),
					{
						expiration: kv_data.expiredAt //not milisends
					}
				);
			}
			/* async function resetKV(user_id: string[]) {
				let time = previous_email_id
					? Math.abs(Date.now() - previous_email_id.created - DAY)
					: DAY;
				await requestHandler.platform?.env.kv_cache.put(
					key,
					JSON.stringify({
						user_ids: user_id,
						created: !previous_email_id ? Date.now() : previous_email_id.created
					}),
					{
						expirationTtl: previous_email_id ? time : DAY //1day
					}
				);
			} */
			// send 20 emails
			const send = await batchSendBetaReadMail({
				to: emails.map((v) => v.email),
				username: emails.map((v) => profilesGroup[v.id]?.[0]?.username),
				author: book.data.author_name,
				book_id: query.book_id,
				book_name: book.data.title,
				url: url,
				words:
					query.words ?? 'Please give a read and let me know what you think !',
				cover_url: book.data.cover_url,
				description: book.data.summary
			});
			await resetKV();
			console.log('email sent', send);
			return json(
				{
					success: send,
					invalid: invalid_user_ids.length,
					invalid_message: invalid_user_ids?.[0]
				},
				200
			);
		}
	)
	.post(
		'/get_readers',
		zValidator(
			'json',
			z.object({
				book_id: BigIntIdsZod,
				start: z.number(),
				end: z.number(),
				is_beta_reader: z.boolean().nullish(),
				accepted_reader: z.boolean().nullish(),
				username: z.string().optional()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const start = query.start;
			console.log('request', query);
			const sql = sqlInstance();
			const user_details = await sql`
			/* 
				How we fetch available beta reader ?
						check if user have explicate deny on book-level (user_book_data)
							if explicit allow then allow
							if explicit deny : deny
							if null: 
								check if user have explicate deny on global user setting level (user_global_configs)
									if yes: deny
									if no: allow
			 */

			select id,
			
			book_id,

			profiles.id as user_id,
			
			profiles.created_at,
			
			user_book_data.updated_at,
			
			username,
			
			user_global_configs.author_invitation_count as author_invitation_count,  -- how many email can this user get today?

			user_global_configs.max_author_invitation_per_day as max_author_invitation_per_day,

			user_global_configs.is_beta_reader as global_is_beta_reader,
			--b.c as reviews,
			user_book_data.is_beta_reader as book_level_is_beta_reader,

			accepted_reader,

			profiles.like_count, 
			
			profiles.dislike_count  from 
			
			user_book_data 
	
			right join profiles on profiles.id =user_book_data.user_id and user_book_data.book_id =${query.book_id}
			-- inner join auth.users as u on u.id=user_book_data.user_id
			left join user_global_configs on user_global_configs.user_id = profiles.id

			-- , lateral (select count(*) from reviews where reviews.user_id =user_book_data.user_id ) as b

			where

			/* ${query.accepted_reader ? sql`accepted_reader = ${query.accepted_reader} and  ` : sql``} */

			${query.is_beta_reader ? sql`user_book_data.is_beta_reader = ${query.is_beta_reader} and  ` : sql``}

			${query.username ? sql`   profiles.username ilike ${'%' + query.username + '%'} and` : sql``}

			 (user_book_data.is_beta_reader is true or (user_book_data.is_beta_reader is null and user_global_configs.is_beta_reader is not false)) 

			and (user_global_configs.author_invitation_count > 0 or user_global_configs.author_invitation_count is null)

			order by profiles.id
			
			offset ${Math.max(start * MAX_READER - 1, 0)} limit ${MAX_READER} 
			`;
			console.log(user_details);

			if (query.start - query.end < -50) {
				throw new Error('Invalid Params');
			}
			let test = user_details as any as (typeof s)[];
			const s = {
				id: 'ed79fb06-4abe-46a4-a524-8c148eac37d9',
				book_id: null,
				user_id: 'ed79fb06-4abe-46a4-a524-8c148eac37d9',
				created_at: '2024-07-28T03:30:16.765Z',
				updated_at: null,
				username: 'Dev',
				author_invitation_count: 18,
				max_author_invitation_per_day: 18,
				global_is_beta_reader: true,
				book_level_is_beta_reader: null,
				accepted_reader: null,
				like_count: 0,
				dislike_count: 0
			};

			for (let x of test) {
				if (x.user_id) {
					x.author_invitation_count =
						x.author_invitation_count ??
						DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY;
					x.max_author_invitation_per_day =
						x.max_author_invitation_per_day ??
						DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY;

					const enable_near_rt_enrichment = false; //TODO calls Do to get counts , db could be lagged behind
					if (enable_near_rt_enrichment) {
						const id = requestHandler.platform?.env.do_EmailCounter.idFromName(
							x.user_id
						);
						if (id) {
							const stub =
								await requestHandler.platform?.env.do_EmailCounter.get(id);
							console.log('getting stub', stub);
							const getUsedCount = await stub?.fetch(
								'https://www.google.com?max_count=' +
									(x.max_author_invitation_per_day ?? MAX_READER)
							);
							console.log(getUsedCount?.statusText);
							if (getUsedCount?.status === 200) {
								const res = await getUsedCount?.json();
								Object.assign(x, res);
							}
						}
					}
				}
			}

			return json(test);
		}
	)
	.post(
		'/notify_author',
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
	.get(
		'/emailed_count_today',
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const data: KV_BETA_READER_EMAILED_COUNT =
				await requestHandler.platform?.env.kv_cache.get(
					KV_BETA_KEYS(uid),
					'json'
				); //FIXME dont use kv to count user emailed count
			console.log(data);
			return json({
				count: data?.user_ids?.length ?? 0,
				uesrs: data?.user_ids ?? []
			});
		}
	);

export const betaReaderApi = new Hono().post(
	'/refresh_invitation_count',
	zValidator(
		'json',
		z.object({
			api_key: z.string().optional(),
			count: z.number(),
			user_id: z.string().uuid(),
			max_count: z.number().default(DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY)
		})
	),
	async ({ req, json, var: { requestHandler } }) => {
		const query = req.valid('json');
		console.log(
			'update user invitation',
			query,
			req.url.toString(),
			requestHandler.url.searchParams.get('key')
		);
		if (
			requestHandler.url.searchParams.get('key') !==
				EMAIL_COUNTER_API_SECRET_TOKEN &&
			query.api_key !== EMAIL_COUNTER_API_SECRET_TOKEN
		) {
			console.error('invalid key');
			return json('cannot update db');
		}

		const uid = query.user_id;
		const res = await supabaseServer()
			.from('user_global_configs')
			.upsert({ author_invitation_count: query.count, user_id: uid })
			.eq('user_id', uid);

		return json({ res: res });
	}
);

export const betaReaderApiApp = new Hono()
	.route('/protected', urlProtected)
	.route('/', betaReaderApi)
	.onError((v, c) => {
		console.error(v);
		return c.json(
			{ message: v.message },
			{
				status: v.status ?? 500
			}
		);
	});
