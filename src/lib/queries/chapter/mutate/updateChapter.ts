import { getUserIDFromLocalStorage } from '$lib/queries/user';
import type { action } from '$lib/data/dbConstants';
import { actionToStatus } from '$lib/data/dbConstants';
import { preprocessChapter } from '$lib/utils/preprocessChapter';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { queryKey } from '$lib/queries/constants';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';
import type { Nullable, chapter } from '$lib/types';
import { chapterSchema } from '$lib/schema';
import { CustomError } from '$lib/queries/base/errors';
import { removeNil, responseUnwrap } from '$lib/queries/util';
import { client } from '$lib/queries/api';
import { EnglishWordCount, stripHTML } from '$lib/utils/fileUtils';
import { InkStore } from '../../../../routes/(space)/store.svelte';
import { toastNotify } from '$lib/utils/toast';
export async function updateChapter(
	data: Nullable<chapter> & { action?: action | 'UPDATE' }
) {
	console.log('update chapter ', data);
	const userid = await getUserIDFromLocalStorage();

	console.log('user id is ', userid);
	const should_update_book_list =
		data.status === 'published' || data.action === 'publish';
	if (!data.action) {
		console.error('no action found for update chapter');
		throw 'no action found';
	}
	//TODO implement delete ?
	/* if (data.action == 'delete' && data.id) {
		// delete the chapter
		const ret = await supabase
			.from('chapters')
			.delete()
			.eq('id', data.id)
			.eq('author_id', userid);
		if (ret.error) {
			throw ret.error;
		}
		console.log('deleted chapter', data, ret.data);
		return {
			book_id: data.book_id,
			id: data.id,
			action: data.action,
			should_update_book_list
		};
	} */
	//@ts-expect-error we don't update status if it a chapter sequence change, below return undefined
	const nextStatus = actionToStatus[data.action];
	delete data.action;
	const fields = {
		title: data.title,
		sequence: data.sequence,
		content:
			typeof data.content == 'string'
				? await preprocessChapter(data.content)
				: undefined,
		authors_words: data.authors_words,
		status: data.status ?? 'draft',
		id: data!.id,
		book_id: InkStore.book.id,
		lang: InkStore.book.language
	} as const;
	removeNil(fields);
	/* const val = chapterSchema.safeParse(fields);
	if (!val.success)
		throw new CustomError(val.error.issues.map((v) => v.message).toString()); */
	// remove undefined fields
	console.log('start updating', fields);

	const info = await client.rest.api.chapters.protected.update.$post({
		json: fields
	});
	const response = await responseUnwrap(info);

	let out = { ...fields, ...response, should_update_book_list };
	return out;
}

export function useUpdateChapter(toast: boolean = true) {
	const queryClient = useQueryClient();

	return createMutation(() => { return {
		meta: { toast: toast ?? true },
		mutationFn: updateChapter,
		onSuccess: (data) => {
			/* if (data.should_update_book_list)
				queryClient.invalidateQueries({
					queryKey: queryKey.getAuthoredBooks()
				}); */
			if (data.book_id)
				queryClient.setQueryData(
					queryKey.getAllChapters({
						id: data.book_id
					}),
					(old: chapter[]) => {
						// update chapter query without content,
						// do not update chapter query with content
						const v = old as chapter[];
						if (old) {
							const i = v.findIndex((v) => v.id == data.id);
							console.log('found old', old, i);
							//@ts-expect-error delete action
							if (data?.action == 'delete') {
								console.log('no id exists, delete data from cache');
								//deleted chapter
								v.splice(i, 1);
								return JSON.parse(JSON.stringify(old));
							}
							//@ts-expect-error ts not happy
							if (i >= 0) v[i] = Object.assign(v[i], data);
							return JSON.parse(JSON.stringify(old));
						}
					}
				);
		}
	} });
}
export function useScheduleChapter(toast: boolean = true) {
	const queryClient = useQueryClient();

	return createMutation(() => { return {
		meta: { toast: toast ?? true },
		mutationFn: async (
			args: Parameters<
				typeof client.rest.api.chapters.protected.schedule.$post
			>[0]['json']
		) => {
			const res = await client.rest.api.chapters.protected.schedule.$post({
				json: args
			});
			return responseUnwrap(res);
		},
		onSuccess: (data) => {
			toastNotify.success('Chapter Scheduled To Publish !');
		}
	} });
}
export function useUnScheduleChapter(toast: boolean = true) {
	const queryClient = useQueryClient();

	return createMutation(() => { return {
		meta: { toast: toast ?? true },
		mutationFn: async (
			args: Parameters<
				typeof client.rest.api.chapters.protected.unschedule.$post
			>[0]['json']
		) => {
			const res = await client.rest.api.chapters.protected.unschedule.$post({
				json: args
			});
			return responseUnwrap(res);
		},
		onSuccess: (data) => {}
	} });
}
