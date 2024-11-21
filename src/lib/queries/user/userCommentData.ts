import { queryKey, TABLES } from '$lib/queries/constants';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import {
	QueryClient,
	createMutation as createMutation,
	createQuery as useQuery /*  */,
	useQueryClient
} from '@tanstack/svelte-query';

import type { commentJoined, user_comment_data } from '$lib/types';
import { getLocalUser, getUserIDFromLocalStorage } from './getUser';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { responseUnwrap } from '../util';

const table = TABLES.user_comment_data;
async function get(id: number) {
	const userID = await getUserIDFromLocalStorage();
	if (!userID) throw { message: 'not logged in' };
	const { data, error } = await supabase
		.from(table)
		.select()
		.match({ comment_id: id, user_id: userID })
		.maybeSingle();

	if (error) throw error;

	return data;
}

async function update(
	props: Parameters<
		typeof client.rest.api.comments.protected.update_user_info.$post
	>[0]['json']
) {
	console.log('update user comment data', props);
	const userID = (await getLocalUser()).id;
	if (!userID) throw { message: 'not logged in' };
	const res = await client.rest.api.comments.protected.update_user_info.$post({
		json: {
			...props,
			id: props.id,
			is_like: props.is_like ?? null
		}
	});
	const data = await res.json();
	if (res.status !== 200) {
		throw new CustomError(data?.message ?? 'Failed to update ');
	}
	console.log('update user comment data', data);

	return {
		...data,
		user_id: userID
	} as user_comment_data;
}

/* export function useCreateUserCommentData() {
	const client = useQueryClient();

	return createMutation(() => { return {
		mutationFn: create,
		onSuccess: (data) => {
			updateCache(client, data);
		}
	} });
} */

export function useUpdateUserCommentData() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		onSuccess: (data) => {
			client.setQueriesData(
				{
					predicate: (query) => {
						return query.queryKey.includes('user_comment_data');
					}
				},
				(old: commentJoined[] | commentJoined | undefined) => {
					if (!old) return;

					if (old) {
						if (Array.isArray(old))
							for (let old_item of old) {
								if (old_item.id == data.comment_id) {
									old_item.user_comment_data = [data];
									break;
								}
							}
						else {
							if (old['user_comment_data'] && old.id === data.comment_id)
								old.user_comment_data = [data];
						}
					}
					//console.log('update comment cache ', data);
					return JSON.parse(JSON.stringify(old));
				}
			);
		}
	} });
}

function updateCache(client: QueryClient, data: user_comment_data) {
	client.setQueriesData(
		{
			predicate: (query) => {
				return query.queryKey.includes('user_comment_data');
			}
		},
		(old: commentJoined[] | commentJoined | undefined) => {
			if (!old) return;
			if (old) {
				if (Array.isArray(old))
					for (let old_item of old) {
						if (old_item.id == data.comment_id) {
							old_item.user_comment_data = [data];
							break;
						}
					}
				else {
					if (old['user_comment_data'] && old.id === data.comment_id)
						old.user_comment_data = [data];
				}
			}
			//console.log('update comment cache ', data);
			return JSON.parse(JSON.stringify(old));
		}
	);
}
