import { CustomError } from '$lib/queries/base/errors';
import { supabase } from '$lib/supabaseClient/client';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { book, ID } from '$lib/types';
import {
	bookCols,
	bookSelectFields,
	user_book_data_fields
} from '$lib/queries';
import type { book_setting } from '../bookApp.server';
import { KV } from './kv';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import { writable } from 'svelte/store';
const PRIO = {
	HIGHEST: 4,
	HIGH: 3,
	MEDIUM: 2,
	LOW: 1
} as const;

export async function verifyPreviewId({
	preview_id,
	chapter_id = null,
	book_id
}: {
	preview_id?: number | string;
	chapter_id?: number | string | null;
	book_id: number | string;
}) {
	const valid_id = schema.safeParse({ preview_id, book_id, chapter_id });
	if (valid_id.error || !preview_id) {
		throw new Error(valid_id?.error?.issues.map((v) => v.message).join(','));
	}
	//const uid = await getUserIDFromLocalStorage();
	//TODO user need to be logged in check? no because we want people to read it easily
	//FIXME check if user is emailed user?
	const preview = await supabaseServer()
		.from('previews')
		.select('*')
		.eq('id', valid_id.data.preview_id)
		.eq('book_id', book_id)
		.single();
	if (preview.error) {
		throw new Error('unable to find preview in db', { cause: preview.error });
	}
	const { ttl, created_at, description } = preview.data;
	console.log('diff', preview, chapter_id, book_id);
	if (isNil(chapter_id) === false && preview.data.chapter_id != chapter_id) {
		throw new CustomError('Preview Rejected - Invalid Book Id/Chapter Id');
	}

	const isExpired = isBefore(
		ttl * 3600 * 1000 + new Date(created_at).getTime(),
		Date.now()
	);
	const gap = formatDistance(
		addMilliseconds(new Date(), ttl * 3600000),
		Date.now()
	);
	if (isExpired) {
		console.log('deleting expired prevew session');
		const del = await supabaseServer()
			.from('previews')
			.delete()
			.eq('id', preview_id);
		if (del.error) console.error('failed to delete preview', del);
		throw new Error('Preview Id Expired ' + gap);
	}
	return {
		preview: preview.data,
		isSingleChapter: typeof preview.data.chapter_id === 'number',
		expireIn: formatDistance(
			addMilliseconds(new Date(), ttl * 3600000),
			Date.now()
		),
		url: generatePreviewURL({ book_id, chapter_id, id: preview_id }),
		book_id,
		chapter_id: preview.data.chapter_id,
		created_at
	};
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
	const acl = {
		readable: false,
		writable: false,
		searchable: false,
		isUsingPreviewURL: false,
		preview_url: false,
		prio: PRIO.HIGH
	};
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
				acl.readable = true;
				return acl;
			}
		}
		throw new CustomError('Sorry, Book is not public(hidden?)');
	}
	return acl;
}

export function canBook({
	book,
	is_hidden,
	user_id
}: {
	status: string;
	is_hidden?: boolean;
	user_id: string;
	book?: book;
	/**
	 * @description preview url
	 */
	preview_url?: string;
}): { read: boolean; prio: number } {
	const book = book ?? (await supabaseServer());
	if (is_hidden) {
		//
	}

	return { prio: PRIO.HIGH, read: true };
}
export function canChapter(props: {
	status: string;
	is_hidden?: boolean;
	user_id: string;
	book?: book;
	/**
	 * @description preview url
	 */
	preview_url?: string;
}): { read: boolean; prio: number } {
	const data = await canBook(props);
	return { prio: PRIO.HIGH, read: true };
}
