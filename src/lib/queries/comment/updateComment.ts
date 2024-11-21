import { getLocalUser, getUserIDFromLocalStorage } from '$lib/queries/user';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import { user } from '$lib/state/runes.svelte';
import type { comment } from '$lib/types';
import { merge } from 'lodash-es';
import { queryKey } from '..';
import { client } from '../api';
import { matchPartialJson, responseUnwrap } from '../util';

export async function update(data: {
	id: comment['id'];
	content: string;
	tags: string[];
}) {
	const data1 = await client.rest.api.comments.protected.update.$post({
		json: {
			...data,
			username: user.username
		}
	});
	return responseUnwrap(data1);
}
export function useUpdateComment() {
	const queryClient = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		onSuccess: (c) => {
			queryClient.setQueriesData(
				{
					predicate: (query) => {
						return matchPartialJson(
							query.queryKey,
							queryKey.getUserComment({
								section_id: c.section_id,
								parent_id: c.parent_id
							})
						);
					}
				},
				(old) => {
					if (Array.isArray(old)) {
						for (let x of old) {
							if (x.id === c.id) {
								merge(x, c);
							}
						}
						return [...old];
					}
					if (old && old.id === c.id) {
						return JSON.parse(JSON.stringify(Object.assign(old, c)));
					}
					return old;
				}
			);
		},
		meta: { toast: true }
	} });
}
// get logged in user or other user
// get all user comments for this section/paragraph
export function useMarkCommentRead() {
	return createMutation(() => { return {
		mutationFn: async (ids?: comment['id'][]) => {
			return responseUnwrap(
				await client.rest.api.comments.protected.mark_read.$post({})
			);
		},
		meta: {
			toast: true
		}
	} });
}
