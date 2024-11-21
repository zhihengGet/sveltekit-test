import { supabase } from '$lib/supabaseClient/client';
import type { chapter, user_chapter_data } from '$lib/types';
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { user_chapter_data_fields } from '../fields';
import { contains, removeNil, responseUnwrap } from '$lib/queries/util';
import { getLocalUser } from '$lib/queries/user/getUser';
import { client } from '$lib/queries/api';
import { CustomError } from '$lib/queries/base/errors';
import { sleep } from '$lib/utils/sleep';

const post = client.rest.api.chapters.protected.update_user_info.$post;
async function update(args: Parameters<typeof post>[0]['json']) {
	removeNil(args, ['is_like']);
	const data = await client.rest.api.chapters.protected.update_user_info.$post({
		json: { ...args }
	});
	const res = await data.json();
	if (data.status !== 200) {
		throw new CustomError(res.message ?? 'Unable to update user chapter');
	}
	return res;
}
async function create(
	args: Partial<
		Pick<
			user_chapter_data,
			'is_bookmark' | 'is_like' | 'bookmark_notes' | 'chapter_id' | 'book_id'
		>
	>
) {
	//const uid = (await getLocalUser()).id;
	if (!args.book_id || !args.chapter_id) throw new Error('missing required id');
	removeNil(args, ['is_like']);
	const post = client.rest.api.chapters.protected.create_user_info.$post;
	const r = await post({ json: { ...args } });
	const data = await responseUnwrap(r);

	return data;
}
function useUpdateChapterUserData() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		onSuccess: (data) => {
			client.setQueriesData(
				{
					predicate: (query) => {
						return contains(query.queryKey, [
							'user_chapter_data',
							data.chapter_id
						]);
					}
				},
				(old) => {
					if (Array.isArray(old) == false) return data;
					return old;
				}
			);
		}
	} });
}
function useCreateUserChapterData() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: create,
		onSuccess: (data) => {
			client.setQueriesData(
				{
					predicate: (query) => {
						return contains(query.queryKey, [
							'user_chapter_data',
							data.chapter_id
						]);
					}
				},
				(old) => {
					if (Array.isArray(old) == false) return data;
					return old;
				}
			);
		}
	} });
}
export { useUpdateChapterUserData, useCreateUserChapterData };
