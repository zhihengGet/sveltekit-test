import { isDefaultFolder } from '$components/folders/folderUtils';
import {
	bookCols,
	bookSelectFields,
	user_book_data_fields
} from '$lib/queries';
import { CustomError } from '$lib/queries/base/errors';
import {
	getFacetValues,
	getServerBooks,
	getServerBooksSearcher
} from '$lib/queries/book/book.server';
import {
	bookSchema,
	bookSchemaCreate,
	bookSchemaQuery,
	bookUpdateSchema
} from '$lib/schema/bookSchema';
import {
	BigIntIdsZod,
	genZodSchemaObject,
	page
} from '$lib/schema/querySchema/zodPagination';
import { supabase } from '$lib/supabaseClient/client';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { isNil, uniq } from 'lodash-es';
import top_sites from 'top-sites';
import { array, boolean, object, string, z } from 'zod';
import type { apiEnv } from './[...paths]/+server';
import { social } from './utils/social';
import { queryAnalytics } from './worker_query_util.server';
import type {
	book,
	book_stats,
	bookWithUserInfo,
	ID,
	user_book_data
} from '$lib/types';
import { KV } from './utils/kv';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { verifyPreviewId } from './previewApp.server';
import { isNoRow } from '$lib/queries/client';
import { format, isDate, isValid } from 'date-fns';
import type BookSelect from '$lib/composite/BookSelect.svelte';
import { renameBookTitle } from '$lib/queries/book/deleteBook';
import { error } from '@sveltejs/kit';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import { bookConfig } from '$lib/schema/bookConfigSchema';
import { getPublicBookCoverUrlSync } from '$lib/queries/storage/ObjectKey';
import { getPublicBookCoverUrl } from '$lib/queries/storage/useUpload';
import { genID } from './utils/getUUID';
import { UserBookDataSchema } from '$lib/schema/userBookDataSchema';
import { MAX_TAG_LENGTH, MAX_TAGS } from '$lib/data/constants';
import { createBookEvent } from './utils/user_event';
import { updateBook } from './statsApp.sever';
import { BOOK_STATS_API_API_SECRET_TOKEN } from '$env/static/private';
import {
	getSearchClient,
	scheduleBookStatsUpdate,
	syncToSearchEngine
} from './utils/middleware.server';

const DEFAULT_DATE = format(new Date('2200-1-1'), 'yyyy-MM-dd');
const DEFAULT_DATE_FORBID = '2000-01-01';
export const DEFAULT_BOOK_CONFIGURATION: book_setting = {
	allow_copy: false,
	allow_chapter_read_on_hide: false,
	notifyOnReview: DEFAULT_DATE,
	notifyOnFirstComment: DEFAULT_DATE_FORBID,
	notifyOnUserCommentReply: false,
	maxReviewTradeDaily: 0,
	discontinue: false,
	freeARCCopy: false,
	twitter: '',
	facebook: '',
	patreon: '',
	reddit: '',
	discord: ''
};
export type book_setting = bookConfig;
type bookWithCustomTag = book & user_book_data & { customUserTags: string[] };
export type customShelvedBook = {
	books: bookWithCustomTag[];
	customUserTags: string[]; //all tags
};
export async function getBookConfig(
	platform: Readonly<App.Platform>,
	book_id: string
): Promise<book_setting> {
	return (
		(await platform?.env.kv_cache.get(
			KV.AUTHOR_SETTING_BOOK_LEVEL(book_id),
			'json'
		)) ?? DEFAULT_BOOK_CONFIGURATION
	);
}
export async function getShelfTags(
	platform: Readonly<App.Platform>,
	user_id: string
) {
	return (
		(await platform?.env.kv_cache.get(KV.USER_SHELF(user_id), 'json')) ?? []
	);
}
export async function setShelfTags(
	platform: Readonly<App.Platform>,
	tags: string[],
	user_id: string
) {
	return await platform?.env.kv_cache.put(
		KV.USER_SHELF(user_id),
		JSON.stringify(tags)
	);
}
/**
 *
 * @description is chapter or api call allowed to be read/called by user, owner of the book is always permitted
 * @returns boolean
 */
export async function isBookPermitted(data: {
	book?: book; // initial data
	fetchTable?: boolean;
	user_id: ID;
	book_id: ID;
	chapter_id?: ID;
	kv_cache: KVNamespace;
	preview_id?: ID;
	throw?: boolean;
}) {
	const book = data.book
		? { data: data.book, error: null }
		: await supabaseServer()
				.from('books')
				.select(bookCols)
				.eq('id', data.book_id)
				.single();
	console.log('verify book data', book);
	if (book.error) {
		throw new CustomError('Book does not exists ? ' + book.error.message);
	}
	if (
		book.data?.is_visible === false &&
		data.user_id !== book.data?.author_id
	) {
		//check if author allow shelved user to read
		const config: book_setting | null = await data.kv_cache.get(
			KV.AUTHOR_SETTING_BOOK_LEVEL(data.book_id),
			'json'
		);
		console.log('config', data);
		if (config?.allow_chapter_read_on_hide && data.user_id) {
			// check if user is shelved
			const user = await sqlInstance()`
				select is_shelved from user_book_data
				where book_id=${data.book_id} and user_id=${data.user_id}
			`;
			//console.log('user shelved', user);
			if (user.length > 0 && user?.[0]?.is_shelved) {
				return book.data;
			}
		}
		throw new CustomError('Sorry, Book is not public(hidden?)');
	}
	return book.data;
}
export const booksAppProtected = new Hono()
	.get(
		'/getShelvedBook',
		zValidator(
			'query',
			page.merge(
				object({
					folder: string(),
					count: string().transform((v) => {
						return v === 'true' ? true : false;
					})
				})
			)
		),
		async ({ req, json, var: { requestHandler } }) => {
			console.log('user', req.valid('query'));
			const param = req.valid('query');
			const uid = requestHandler.locals.user?.id;
			let books = await getServerBooks({
				filter: {},
				paginate: { start: param.start, end: param.end },
				restFilter: [
					['user_book_data.user_id', 'eq', uid],
					['user_book_data.is_shelved', 'eq', 'true'],
					isDefaultFolder(param.folder, [param.folder])
						? ['user_book_data.folder', 'in', `("default","")`]
						: ['user_book_data.folder', 'eq', param.folder]
				],
				join: {
					withUserInfo: true,
					inner: true
				},
				options: param.count
					? {
							countStrategy: 'exact',
							countOnly: true
						}
					: undefined
			});

			return json(books);
		}
	)
	.post(
		'/update_user_book_data',
		zValidator(
			'json',
			object({
				//is_shelved: boolean().optional(),
				last_chapter_read: BigIntIdsZod.optional(),
				folder: string().optional(),
				author_folder: string().optional(),
				book_id: BigIntIdsZod.optional(),
				book_ids: array(BigIntIdsZod).optional(),
				is_beta_reader: boolean().optional().nullable()
			}).partial()
		),
		async ({ json, req, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const props = req.valid('json');
			console.log('update user book data', props, uid);

			const ids = props.book_id ? [props.book_id] : props.book_ids;
			if (!ids) throw new Error('must provide book_id');
			//WARN check if user can shelf, user cannot shelf a hidden book
			let builder = supabase
				.from('user_book_data')
				.upsert(
					ids.map((v) => {
						return {
							...props,
							last_chapter_read: props.last_chapter_read,
							user_id: uid,
							...(!isNil(props.folder)
								? { folder: props.folder }
								: { folder: 'default' }),
							...(!isNil(props.author_folder)
								? { author_folder: props.author_folder }
								: { author_folder: 'default' }),
							book_id: v
						};
					}),
					{ onConflict: 'book_id,user_id', ignoreDuplicates: false }
				)
				.match({ user_id: uid })
				.in('book_id', ids)
				.select(user_book_data_fields);

			const res = await builder;
			if (res.error) throw new Error(res.error.message);

			return json(res.data as any as user_book_data, 200);
		}
	)
	.post(
		'/shelf',
		zValidator('json', UserBookDataSchema),
		async ({ json, req, var: { requestHandler } }) => {
			/* we don't need to update tags if user create a new tag because we fetch all tags and merge */
			const uid = requestHandler.locals.user_id;
			const props = req.valid('json');
			console.log('sehlf book', props, uid);
			//WARN check if user can shelf, user cannot shelf a hidden book
			if (props.is_shelved === true) {
				await isBookPermitted({
					user_id: uid,
					book_id: props.book_id,
					kv_cache: requestHandler.platform?.env.kv_cache
				});
			}
			let builder = supabase
				.from('user_book_data')
				.update({
					...props,
					is_shelved: props.is_shelved,
					user_id: uid,
					book_id: props.book_id
				})
				.match({ user_id: uid, book_id: props.book_id })
				.select(user_book_data_fields)
				.single();

			const res = await builder;
			if (res.error) {
				if (isNoRow(res.error)) {
					let builder = await supabase
						.from('user_book_data')
						.insert({
							...props,
							is_shelved: props.is_shelved,
							user_id: uid,
							book_id: props.book_id,
							author_folder: 'default',
							folder: 'default'
						})
						.select(user_book_data_fields)
						.single();
					if (builder.error) {
						throw new CustomError(builder.error.message);
					}
					return json(builder.data, 200);
				}
				throw new CustomError(res.error.message);
			}
			/* */
			return json(res.data, 200);
		}
	)
	/* update multiple user book data */
	.post(
		'/update_shelf',
		zValidator(
			'json',
			z.object({
				books: z.array(
					bookSchema.merge(
						z.object({
							customUserTags: z
								.array(z.string().max(MAX_TAG_LENGTH))
								.max(MAX_TAGS),
							is_shelved: z.boolean().default(true)
						})
					)
				),
				all_tags: z
					.array(z.string().max(MAX_TAG_LENGTH))
					.max(MAX_TAGS)
					.nullish()
			})
		),
		async ({ json, req, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const props = req.valid('json');
			props.all_tags = uniq(props.all_tags);
			if (props.all_tags) {
				const tags = await supabase
					.from('user_shelf_settings')
					.upsert(
						{ folders: props.all_tags, user_id: uid },
						{ onConflict: 'user_id', ignoreDuplicates: false }
					);

				if (tags.error) {
					throw tags.error;
				}
			}
			//update each book 's tag or shelved count
			for (let x of props.books) {
				let builder = await supabase
					.from('user_book_data')
					.update({
						is_shelved: x.is_shelved,
						tags: uniq(x.customUserTags),
						/* deprecated */
						author_folder: 'default',
						folder: 'default'
					})
					.match({ user_id: uid, book_id: x.id })
					.single();
				if (builder.error) {
					throw new CustomError(builder.error.message);
				}
			}
			return json({}, 200);
		}
	)
	.get(
		'/stats/referrer',
		zValidator('query', object({ book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.eq('author_id', requestHandler.locals.user.id)
				.single();

			if (b.error) {
				throw new Error(b.error.message);
			}
			// get
			const data: { data: { count: number; referrer: string }[] } =
				await queryAnalytics(`
					select sum(double1) as count, blob3 as referrer from BOOK_REFERRER WHERE index1 = '${query.book_id}' and timestamp > NOW() - INTERVAL '60' DAY GROUP BY referrer order by count desc 
				`);

			return json(data.data);
		}
	)
	.get(
		'/stats/clicks',
		zValidator('query', object({ book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.eq('author_id', requestHandler.locals.user.id)
				.single();

			if (b.error) {
				throw new Error(b.error.message);
			}
			const data: { data: { created_at: number; clicks: string }[] } =
				await queryAnalytics(`
					select blob4 as created_at, sum(_sample_interval * double1) as clicks from BOOKS WHERE index1 = '${query.book_id}' and timestamp >= NOW() - INTERVAL '90' DAY GROUP BY created_at order by clicks desc 
				`);

			return json(data.data);
		}
	)
	.get(
		'/stats/device',
		zValidator('query', object({ book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.eq('author_id', requestHandler.locals.user.id)
				.single();

			if (b.error) {
				throw new Error(b.error.message);
			}
			const data: {
				data: { created_at: number; device: string; count: string }[];
			} = await queryAnalytics(`
					select blob4 as created_at, count(blob3) as count , blob3 as device from BOOKS WHERE index1 = '${query.book_id}' and timestamp <= NOW() - INTERVAL '90' DAY GROUP BY device order by count desc 
				`);

			return json(data.data);
		}
	)
	.get(
		'/stats/age_dist',
		zValidator('query', object({ book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.eq('author_id', requestHandler.locals.user.id)
				.single();

			if (b.error) {
				throw new Error(b.error.message);
			}
			const user = (await requestHandler.locals.sql()`
					select extract(year from profiles.birthday - now()) as age, count(extract(year from profiles.birthday - now()))
					from profiles 
					inner join user_book_data
					on profiles.id = user_book_data.user_id
					inner join books
					on user_book_data.book_id=books.id
					where books.id=${query.book_id} and profiles.birthday is not null  and books.author_id =${b.data.author_id} and user_book_data.is_shelved= True
					group by age
					`) as { age: string; count: string }[];
			console.log(user);
			return json(user, { status: 200 });
		}
	)
	.get(
		'/stats/industry',
		zValidator('query', object({ book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.eq('author_id', requestHandler.locals.user.id)
				.single();

			if (b.error) {
				throw new Error(b.error.message);
			}
			const user = (await requestHandler.locals.sql()`
			select profiles.industry, count(profiles.industry) as referrer_count
            from profiles
            inner join user_book_data ubd on ubd.user_id = profiles.id
            inner join books on books.id =ubd.book_id
            where books.id=${b.data.id} and books.author_id=${b.data.author_id} and ubd.is_shelved=True
            group by profiles.industry
		`) as { industry: string; referrer_count: string }[];
			console.log(user);
			return json(user, { status: 200 });
		}
	)
	.post(
		'/create_book',
		zValidator('json', bookSchemaCreate),
		async ({ json, req, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const profile = await requestHandler.locals.supabase
				.from('profiles')
				.select('username,id')
				.eq('id', uid)
				.single();
			if (profile.error) throw profile.error;

			const data = {
				...query,
				author_name: profile.data.username,
				author_id: uid,
				cover_url: '',
				id: genID()
			};
			const res = await requestHandler.locals.supabase
				.from('books')
				.insert([data])
				.select(`${bookCols}`)
				.single();

			if (res.error) {
				throw new CustomError(res.error.message);
			}
			createBookEvent({ book: res.data, requestHandler });
			return json(res.data as book);
		}
	)
	.post(
		'/update_book',
		zValidator('json', bookUpdateSchema),
		async ({ json, req, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const profile = await requestHandler.locals.supabase
				.from('profiles')
				.select('username,id')
				.eq('id', uid)
				.single();
			if (profile.error) throw profile.error;
			const data = {
				...query,
				author_name: profile.data.username,
				author_id: uid,
				cover_url: await getPublicBookCoverUrl(query.id), //FIXME save cover_url?
				id: undefined
			};
			console.log('update book', data);
			const res = await requestHandler.locals.supabase
				.from('books')
				.update(data)
				.eq('id', query.id)
				.select(`${bookCols}`)
				.single();

			if (res.error) {
				throw new CustomError(res.error.message);
			}
			return json(res.data as book);
		}
	)
	.post(
		'/author_book_setting',
		zValidator('json', bookConfig.partial()),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			//check if user is the author of the book
			//TODO cache book results
			const owner = await supabaseServer()
				.from('books')
				.select('author_id')
				.match({ id: query.book_id })
				.single();
			if (owner.error) {
				throw new CustomError(owner.error.message);
			}
			if (owner.data.author_id !== uid) {
				throw new CustomError('Not Authorized');
			}
			const setting = await requestHandler.platform?.env.kv_cache.put(
				KV.AUTHOR_SETTING_BOOK_LEVEL(query.book_id),
				JSON.stringify({
					...DEFAULT_BOOK_CONFIGURATION,
					...query
				})
			);
			return json({ message: 'saved' });
		}
	)
	.get('/authored_books', async ({ req, json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user!.id;
		const id = uid;

		let builder = supabase.from('books').select(bookCols).eq('author_id', id);
		const { data, error } = await builder;
		console.log('getAuthoredBooks', data, error);
		if (error) throw error;
		return json(data);
	})
	.post(
		'/hide_book',
		zValidator(
			'json',
			z.object({
				book_id: BigIntIdsZod,
				is_visible: z.boolean(),
				title: z.string() /* .includes('-DELETED-') */
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user?.id;

			const id = uid;
			if (id) {
				const { data, error } = await supabaseServer()
					.from('books')
					.update({
						is_visible: query.is_visible,
						user_modified_at: new Date().toUTCString(),
						title: query.title
					})
					.eq('id', query.book_id)
					.eq('author_id', uid)
					.select(bookCols)
					.single();
				if (error) throw error;
				return json(data as any as BookSelect);
			}
			throw new CustomError('Not Logged In ');
		}
	)
	.get('/recent_read_books', async ({ json, req, var: { requestHandler } }) => {
		//	const query = req.valid('query');
		const user_id = requestHandler.locals.user.id;
		/* because of pg index, this is case insenstive */
		//const uid = requestHandler.locals.user!.id;
		const q = sqlInstance();
		const exists = await q`
			select ${q(bookSelectFields.map((v) => 'books.' + v))}
			from books
			inner join user_book_data on books.id = user_book_data.book_id and user_book_data.is_shelved=true
			where books.is_visible=true 
			limit 20;
		`;
		return json(exists as book[]);
	})
	.get(
		'/shelf/books/all',
		zValidator('query', z.object({ refresh: z.enum(['true', 'false']) })),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('query');
			const user_id = requestHandler.locals.user.id;
			const sql = sqlInstance();
			const alias = { tags: 'customUserTags', updated_at: 'last_read_at' };
			const local = await requestHandler.locals.supabase
				.from('user_shelf_settings')
				.select('*')
				.eq('user_id', user_id)
				.maybeSingle();

			if (local.error) {
				throw local.error;
			}
			// fetch from server or kv ?
			const books = await sql<bookWithCustomTag[]>`
						select ${sql.unsafe(bookSelectFields.map((v) => 'books.' + v).join(',') + ', user_book_data.tags as "customUserTags"')}
						from books 
						inner join user_book_data on books.id = book_id and user_book_data.user_id = ${user_id} and user_book_data.is_shelved=true
						--order by user_book_data.updated_at; 
						`;

			// await requestHandler.platform.env.kv_cache.put(
			// 	KV.USER_SHELF(user_id),
			// 	JSON.stringify(local)
			// );
			// count total tags
			let tags: { [s in string]: number } = {};
			for (let x of books ?? []) {
				for (let y of x.customUserTags ?? []) {
					tags[y] = 1;
				}
			}
			let sorted = uniq(
				[
					'Default',
					'In Progress',
					'Re-Reading',
					'Read later',
					'Finished',
					'Paused',
					'Favorite'
				]
					.sort()
					.map((v) => v.toLowerCase())
					.concat(Object.keys(tags).concat(local.data?.folders ?? []))
			);
			console.log('refresh books', local);
			return json({
				books: books ?? [],
				customUserTags: sorted
			} as unknown as customShelvedBook);
		}
	);
let paginate = genZodSchemaObject(bookSchema.partial());
const publicApp = new Hono<apiEnv>()
	.post(
		'/getBooks',
		zValidator('json', paginate),
		async ({ req, json, var: { requestHandler } }) => {
			const param = req.valid('json');
			console.log('GET BOOK', param);
			const uid = requestHandler.locals.user?.id;
			param.filter.is_visible = true;
			//url.searchParams.set('payload', cacheKey);
			/* requestHandler.locals.setServerClient({
				cf: { cacheTtl: 300, cacheEverything: true }
			}); */
			//@ts-ignore
			const books = await getServerBooksSearcher({
				...param
			});
			let total_docs = books.out_of;
			let count = books.found;
			let facet = books.facet_counts;
			let ex = books.hits?.map((v) => v.document);
			// Reconstruct the Response object to make its headers mutable.
			let response = json({ books: ex, total_docs, matching: count, facet });
			// Set cache control headers to cache on browser for 25 minutes
			if (
				param.filter?.author_id !== requestHandler.locals?.user?.id ||
				!requestHandler.locals?.user?.id
			)
				response.headers.set('Cache-Control', 'max-age=150');
			return response;
		}
	)
	.post(
		'/public_authored_books_paginate',
		zValidator('json', paginate),
		async ({ req, json, var: { requestHandler } }) => {
			const param = req.valid('json');
			console.log('get authored', param);
			const uid = requestHandler.locals.user?.id;
			param.filter.is_visible = true;
			//url.searchParams.set('payload', cacheKey);
			/* requestHandler.locals.setServerClient({
				cf: { cacheTtl: 300, cacheEverything: true }
			}); */
			//@ts-ignore
			const books = await getServerBooks({
				...param
			});
			// Reconstruct the Response object to make its headers mutable.
			let response = json(books);
			// Set cache control headers to cache on browser for 25 minutes
			if (
				param.filter?.author_id !== requestHandler.locals?.user?.id ||
				!requestHandler.locals?.user?.id
			)
				response.headers.set('Cache-Control', 'max-age=150');
			return response;
		}
	)
	.get(
		'/search',
		zValidator('query', z.object({ searchString: z.string().min(0) })),
		async ({ req, json, var: { requestHandler } }) => {
			console.log('user', req.valid('query'));
			const param = req.valid('query');
			//	const stable = stringify(param);
			//const cacheKey = stable;
			const sql = requestHandler.locals.sql();
			const client = getSearchClient();
			const data = await client.collections('books').documents().search({
				q: param.searchString,
				query_by: 'title,author_name,display_name,category,tags'
			});
			console.log('search results', { ...data, hits: data.hits?.length });
			let books = data.hits?.map((v) => v.document) || [];
			// const result = await sql<book[]>`
			// 	select ${sql(bookCols.split(','))} from books where is_visible = true and  (title &@ ${param.searchString} or author_name &@ ${param.searchString}) ORDER BY like_count DESC,created_at asc
			// 	 limit 10
			// `;
			// Reconstruct the Response object to make its headers mutable.
			let response = json(books);
			// Set cache control headers to cache on browser for 25 minutes
			if (
				books[0]?.author_id !== requestHandler.locals?.user?.id ||
				!requestHandler.locals?.user?.id
			)
				response.headers.set('Cache-Control', 'max-age=5');
			return response;
		}
	)
	/**
	 * @deprecated we get all books from kv
	 */
	.get(
		'/getShelvedBook',
		zValidator('query', page.extend({ folder: string() })),
		async ({ req, json, var: { requestHandler } }) => {
			console.log('user', req.valid('query'));
			const param = req.valid('query');
			const uid = requestHandler.locals.user?.id;
			let books = await getServerBooks({
				paginate: {
					...param
				},
				restFilter: [
					['user_book_data.user_id', 'eq', uid],
					['user_book_data.is_shelved', 'eq', 'true'],
					isDefaultFolder(param?.folder, [param.folder])
						? ['user_book_data.folder', 'in', `("default","")`]
						: ['user_book_data.folder', 'eq', param.folder]
				]
			});

			// Reconstruct the Response object to make its headers mutable.
			let response = json(books);
			// Set cache control headers to cache on browser for 25 minutes
			/* if (
				param.filter?.author_id !== requestHandler.locals?.user?.id ||
				!requestHandler.locals?.user?.id
			) */
			response.headers.set('Cache-Control', 'max-age=60');
			return response;
		}
	)
	.post(
		'/stats/referrer',
		zValidator('json', object({ referrer: string(), book_id: BigIntIdsZod })),
		async ({ req, env, json, var: { requestHandler } }) => {
			const query = req.valid('json');

			console.log('update referrer ', query);
			// first check if book id exists
			if (URL.canParse(query.referrer) == false) {
				return new Response(JSON.stringify({ err: 'bad request,invalid arg' }));
			}
			const { origin, protocol } = new URL(query.referrer);
			console.log('origin', new URL(query.referrer));
			const valid_host = Math.max(
				top_sites.findIndex((v) => {
					return v.rootDomain.includes(origin) || origin.endsWith(v.rootDomain);
				}),
				social.findIndex((v) => origin.includes(v.toLocaleLowerCase()))
			);
			if (protocol != 'https:') {
				console.warn('bad protocol for book view update');
				return json('invalid url', { status: 400 });
			}
			if (valid_host == -1) {
				console.warn('bad referrer', query.referrer);
				return json('invalid referrer', { status: 400 });
			}
			// check if book id exists
			const b = await requestHandler.locals.supabase
				.from('books')
				.select('id,author_id,updated_at,title')
				.eq('id', query.book_id)
				.limit(1)
				.single();

			if (b.error) return json(b.error.message, 400);
			// get
			console.log(
				'start saving referrer',
				requestHandler.platform.env.BOOK_REFERRER
			);
			const dataset = requestHandler.platform?.env.BOOK_REFERRER;
			dataset?.writeDataPoint({
				blobs: [query.book_id + '', b.data?.title, origin],
				indexes: [query.book_id + ''],
				doubles: [1] // clicks
			});
			return json(dataset ? 'Service Not Down' : 'Down');
		}
	)
	.get(
		'/public_authored_book_list',
		zValidator('query', z.object({ author_id: BigIntIdsZod.optional() })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user?.id;
			const query = req.valid('query');
			const id = query.author_id ?? uid;
			if (id) {
				let { data, error } = await supabase
					.from('books')
					.select(bookCols)
					.eq('author_id', id)
					.eq('is_visible', true);
				console.log('getAuthoredBooks', data, error);
				if (error) throw error;
				return json(data as book[]);
			}
			return json([]);
		}
	)
	.get(
		'/getBook',
		zValidator('query', z.object({ book_id: BigIntIdsZod })),
		async ({ req, json, var: { requestHandler } }) => {
			console.log('user', req.valid('query'));
			const param = req.valid('query');
			//url.searchParams.set('payload', cacheKey);
			/* requestHandler.locals.setServerClient({
				cf: { cacheTtl: 300, cacheEverything: true }
			}); */
			//@ts-ignore
			const books = await supabaseServer()
				.from('books')
				.select(bookCols)
				.match({ id: param.book_id })
				.single();

			if (books.error) throw books.error;
			if (
				books.data.is_visible === false &&
				books.data?.author_id !== requestHandler.locals.user_id
			) {
				throw new CustomError('Not Authorized');
			}
			let response = json(books.data as book);
			return response;
		}
	)
	.get(
		'/author_book_setting',
		zValidator('query', z.object({ book_id: BigIntIdsZod })),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('query');
			//const uid = requestHandler.locals.user!.id;
			const setting: book_setting =
				(await requestHandler.platform?.env.kv_cache.get(
					KV.AUTHOR_SETTING_BOOK_LEVEL(query.book_id),
					'json'
				)) ?? DEFAULT_BOOK_CONFIGURATION;

			return json(setting);
		}
	)
	.get(
		'/check_title',
		zValidator('query', bookSchema.pick({ title: true })),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('query');
			/* because of pg index, this is case insenstive */
			console.log('checking title', query.title);
			//const uid = requestHandler.locals.user!.id;
			const exists = await supabaseServer()
				.from('books')
				.select('id,title')
				.eq('title', query.title);
			if (exists.error) return json(true);
			console.log(exists);
			return json(!exists.data.length);
		}
	)
	.post(
		'/stats/book',
		zValidator(
			'json',
			z.object({
				id: z.string(),
				secret: z.string()
			})
		),
		async ({ json, req, var: { requestHandler } }) => {
			/* WARN this is an private api for durable object */
			const query = req.valid('json');
			if (query.secret != BOOK_STATS_API_API_SECRET_TOKEN) {
				throw new CustomError('Invalid Call');
			}
			/* because of pg index, this is case insensitive */
			console.log('book stats update scheduler', query.id);
			//const uid = requestHandler.locals.user!.id;
			let data = await updateBook({
				id: query.id,
				sql: requestHandler.locals.sql()
			});
			//await scheduleBookStatsUpdate({ book_id: query.id, requestHandler });
			await syncToSearchEngine({ book_id: query.id });
			console.log('done update books stats in proxy api', data);
			return json({ message: 'updated ' + query.id });
		}
	)
	.get('/facet/default', async ({ json, req, var: { requestHandler } }) => {
		// const query = req.valid('json');
		/* because of pg index, this is case insensitive */
		console.log('getting facet default');
		//const uid = requestHandler.locals.user!.id;
		let data = await getFacetValues();
		return json(data);
	});

export const booksApp = new Hono()
	.route('/', publicApp)
	.route('/protected', booksAppProtected)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});
