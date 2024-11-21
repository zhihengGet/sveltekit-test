import { isDefaultFolder } from '$components/folders/folderUtils';
import { bookCols, user_book_data_fields } from '$lib/queries';
import { CustomError } from '$lib/queries/base/errors';
import { getServerBooks } from '$lib/queries/book/book.server';
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
import { isNil } from 'lodash-es';
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

const DEFAULT_DATE = format(new Date('2200-1-1'), 'yyyy-MM-dd');
const DEFAULT_DATE_FORBID = '2000-01-01';
const DEFAULT_BOOK_CONFIGURATION: book_setting = {
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
export async function getBookConfig(
	platform: Readonly<App.Platform>,
	book_id: number
): Promise<book_setting> {
	return (
		(await platform?.env.kv_cache.get(
			KV.AUTHOR_SETTING_BOOK_LEVEL(book_id),
			'json'
		)) ?? DEFAULT_BOOK_CONFIGURATION
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
			if (user.length > 0 && user[0].is_shelved) {
				return book.data;
			}
		}
		throw new CustomError('Sorry, Book is not public(hidden?)');
	}
	return book.data;
}
export const booksAppProtected = new Hono<apiEnv>()
	.get('/getBookTagsFromKV', async ({ req, json, var: { requestHandler } }) => {
		console.log('user', req.valid('query'));
		const param = req.valid('query');
		const uid = requestHandler.locals.user?.id;
		let books = await requestHandler.platform.env.kv_cache();
		return json(books);
	})
	.get(
		'/getAuthoredBookTags',
		async ({ req, json, var: { requestHandler } }) => {
			console.log('user', req.valid('query'));
			const param = req.valid('query');
			const uid = requestHandler.locals.user?.id;
			let books = await requestHandler.platform.env.kv_cache();
			return json(books);
		}
	)
	.post(
		'/update_shelf',
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

			return json(res.data as user_book_data, 200);
		}
	)
	.post(
		'/shelf',
		zValidator(
			'json',
			object({
				is_shelved: boolean(),
				folder: z.string().optional(),
				book_id: BigIntIdsZod
			})
		),
		async ({ json, req, var: { requestHandler } }) => {
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
			return json(res.data, 200);
		}
	);
let paginate = genZodSchemaObject(bookSchema.partial());

export const booksApp = new Hono<apiEnv>()
	.route('/protected', booksAppProtected)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});
