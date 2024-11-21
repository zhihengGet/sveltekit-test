import { queryKey } from '$lib/queries/constants';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createQuery } from '@tanstack/svelte-query';
import { getLocalUser, getUserIDFromLocalStorage } from '..';

import type { comment, paginateQuery } from '$lib/types';
import { IsomorphicSanitizer } from '$lib/utils';
import { currentComment } from '$lib/../routes/(main)/reader/[book_id]/[chapter_id]/store.svelte';
import { CustomError, loginError } from '../base/errors';
import {
	comment_field,
	comment_with_user,
	fields,
	user_comment_data_fields
} from './fields';
import { user } from '$lib/state/runes.svelte';
import { client } from '../api';
import { removeNil, responseUnwrap } from '../util';
import { keys } from '$lib/utils/getKeys';

async function getComments(data: paginateQuery<comment>) {
	const { filter, paginate } = data;

	const uid = (await getLocalUser()).id; // force user to login to view comments ?
	const match = {
		chapter_id: filter.chapter_id,
		section_id: filter.section_id
	};
	/* if (!paginate.page) {
		console.error('missing page in get comments');
		throw new Error('missing page');
	} */
	removeNil(match);
	console.log('get comment', filter, paginate);
	let query = supabase
		.from('comments')
		.select(`${fields},user_comment_data(${user_comment_data_fields})`)
		.match(match)
		.neq('user_id', uid)
		.range(paginate.start, paginate.end - 1); // inclusive

	if (data.paginate.orderWith) {
		query.order(data.paginate.orderWith, {
			ascending: data.paginate.asc ?? true
		});
	}
	if (data.paginate.orderWithMultiple) {
		for (let x in data.paginate.orderWithMultiple) {
			query.order(x, {
				ascending: data.paginate.orderWithMultiple[x] ?? true
			});
		}
	}
	if (data.restFilter) {
		for (let x of data.restFilter) query = query.filter(x[0], x[1], x[2]);
	}
	if (filter.parent_id == null)
		query = query.filter('parent_id', 'is', filter.parent_id ?? null);
	else query = query.eq('parent_id', filter.parent_id);
	const info = await query;

	if (info.error) {
		console.log('error with get comm', info.error);
		throw info.error;
	}

	for (const x of info.data) {
		x.content = await IsomorphicSanitizer(x.content ?? '');
	}
	return info.data;
}
async function getCommentCount(id?: string) {
	let uid = await getUserIDFromLocalStorage();

	const { count, error } = await supabase
		.from('comments')
		.select('id', { head: true, count: 'exact' })
		.match({ user_id: id ?? uid });

	if (error) throw error;

	return count;
}

async function getUserComment(data: getUserComment) {
	const id = await getUserIDFromLocalStorage();
	if (!id) throw loginError;
	let query = supabase
		.from('comments')
		.select(`${fields},user_comment_data(${user_comment_data_fields})`)
		.match({
			chapter_id: data.chapter_id,
			section_id: data.section_id,
			user_id: id
		});
	if (data.parent_id == null)
		query = query.filter('parent_id', 'is', data.parent_id);
	else query = query.eq('parent_id', data.parent_id);

	const info = await query.limit(1).maybeSingle();

	console.log('get user comment', data, info);
	if (info.error) throw info.error;

	return info.data;
}
async function getUserComments(data: paginateQuery<comment>) {
	const id = await getUserIDFromLocalStorage();
	let query = supabase
		.from('comments')
		.select(
			`${fields},
			books!inner(id,cover_url,title),
			user_comment_data(${user_comment_data_fields}) ` // fetch user and book data
		)
		.match({
			...data.filter,
			user_id: data.filter.user_id ?? id,
			'user_comment_data.user_id': id
		})

		.range(data.paginate.start, data.paginate.end);
	/* 	if (!data.filter.parent_id)
		query = query.filter('parent_id', 'is', data.filter.parent_id || 'null');
	else query = query.eq('parent_id', data.filter.parent_id); */

	if (data.paginate.orderWith) {
		query.order(data.paginate.orderWith, {
			ascending: data.paginate.asc ?? false
		});
	}
	for (const x of keys(data.paginate.orderWithMultiple ?? {})) {
		query.order(x, {
			ascending: data.paginate?.orderWithMultiple?.[x]!.asc
		});
	}
	if (data.search?.regex?.trim())
		query = query.like('books.title', `%${data.search?.regex.trim() ?? ''}%`);
	const info = await query;
	console.log('get user comments', data, info);
	if (info.error) throw info.error;

	return info.data;
}
export type getComment = {
	/**
	 * @description undefined means get all comment, null means when it is top-level comment , root comment
	 */
	section_id: string | null;
	/**
	 * @description get the comment which has this id as parent_id
	 */
	parent_id: number | null;
	chapter_id: number | null;
	user_id?: string;
};

export type getUserComment = {
	section_id?: string | undefined;
	parent_id?: number | null;
	chapter_id?: number | null;
	book_id?: number;
};

type commentProp = { comment_id: number };
// get a single comment
export async function getComment({ comment_id }: commentProp) {
	const { data, error } = await supabase
		.from('comments')
		.select(
			comment_field + ',user_comment_data(' + user_comment_data_fields + ')'
		)
		.eq('id', comment_id)
		.single();
	if (error) throw error;
	return data;
}

export { getCommentCount, getComments, getUserComments };
