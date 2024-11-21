import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import type { PostgrestError } from '@supabase/supabase-js';
import {
	createMutation as createMutation,
	createQuery as useQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { queryKey } from '../constants';

import type { ID, profile, user_book_data } from '$lib/types';
import { CustomError, loginError } from '../base/errors';
import { getLocalUser } from './getUser';
import { isNil } from 'lodash-es';
import { user_book_data_fields, type UserBookInfo } from '../book/fields';
import { disjoint, partialJsonMatch, responseUnwrap } from '../util';
import { user } from '$lib/state/runes.svelte';
import { client } from '../api';
import type { InferRequestType, InferResponseType } from 'hono/client';
import queryClient from '../client';

let updator = client.rest.api.books.protected.update_user_book_data.$post;
let shelfUp = client.rest.api.books.protected.shelf.$post;
type propsType = InferRequestType<typeof updator>;
type shelfType = InferRequestType<typeof shelfUp>;
const fields = user_book_data_fields;

export type SelectedUserBookInfo = UserBookInfo;

export async function getUserDataBook(props: { bookID?: ID }) {
	const uid = (await getLocalUser())?.id;

	const builder = supabase
		.from('user_book_data')
		.select(fields)
		.match({
			user_id: uid,
			book_id: props.bookID
		})
		.maybeSingle();

	const { data, error } = await builder;
	if (error) throw error;

	return data;
}

// support multiple update
export async function updateUserBookData(
	props: Omit<propsType['json'], 'user_id'>
) {
	const uid = (await getLocalUser())?.id;
	console.log('update user book data', props, uid);

	const size = 20;
	let ans = [];
	if (props.book_id) {
		const res = await updator({ json: props });
		if (res.status !== 200) throw new CustomError('failed to update user info');
		const r = await res.json();
		return r;
	}
	for (let i = 0; i < Math.ceil(props.book_ids?.length ?? 0 / size); i++) {
		const chunk = props.book_ids?.slice(i * size, i * (size + 1));

		const res = await updator({ json: { ...props, book_ids: chunk } });
		const result = await res.json();
		if (res.status != 200) throw new CustomError(result?.message);
		ans.push(result);
	}
	ans = ans.flat(1);
	console.log('after update user book data', ans);
	if (props.book_id) return ans[0] as user_book_data;

	return ans as unknown as user_book_data[];
}
export async function updateShelf(props: Omit<shelfType['json'], 'user_id'>) {
	const uid = (await getLocalUser())?.id;
	const res = await shelfUp({ json: props });
	if (res.status !== 200) throw new CustomError('failed to update user info');
	const r = await res.json();
	return r;
}
// get all user data that has shelved==true
/* export function useGetUserShelvedDatas() {
	return useQuery<user_book_data[], PostgrestError>({
		queryKey: queryKey.getUserShelvedBookDatas(),
		queryFn: getShelved
	});
} */
/*
 *@description
 */
export function useGetUserBookData(
	props: () => {
		bookID: ID;
		uid?: profile['id'];
		data: user_book_data | null;
	}
) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getUserBookData(props().bookID),
			queryFn: async () => await getUserDataBook(props()),
			initialData: props().data,
			enabled: !!props().bookID && user.authStatus === 'signed in'
		};
	});
}
export function useUpdateUserBookData() {
	const client = useQueryClient();

	return createMutation(() => {
		return {
			mutationFn: updateUserBookData,
			// When mutate is called:
			onSuccess: (new_data: Awaited<ReturnType<typeof updateUserBookData>>) => {
				const temp = Array.isArray(new_data) == false ? [new_data] : new_data;
				console.log('on success', new_data);
				//WARN update authored books and shelved books's user data (table joins)
				// invalidate count too
				/* 	client.invalidateQueries({
				predicate: (query) => {
					return (
						query.queryKey.includes('shelf') && query.queryKey.includes('book')
					);
				}
			}); */

				if (new_data) {
					for (const id of temp)
						client.setQueryData(queryKey.getUserBookData(id.book_id), () => {
							return { ...id };
						});
				}
			}
		};
	});
}
export function useShelf() {
	const client = useQueryClient();

	return createMutation(() => {
		return {
			mutationFn: updateShelf,
			// When mutate is called:
			onSuccess: (new_data: Awaited<ReturnType<typeof updateUserBookData>>) => {
				const temp = Array.isArray(new_data) == false ? [new_data] : new_data;
				console.log('on success', new_data);
				//WARN update authored books and shelved books's user data (table joins)
				// invalidate count too
				client.invalidateQueries({
					predicate: (query) => {
						if (
							query.queryKey &&
							partialJsonMatch(query.queryKey, queryKey.getUserShelvedBook())
						) {
							console.log('tt', query.queryKey);
							return true;
						}
						return false;
					}
				});

				if (new_data) {
					for (const id of temp)
						client.setQueryData(queryKey.getUserBookData(id.book_id), () => {
							return { ...id };
						});
				}
			}
		};
	});
}

export function useCreateUserBookData() {
	const client = useQueryClient();

	return createMutation(() => {
		return {
			mutationFn: updateUserBookData,
			onSuccess: async (new_data) => {
				if (new_data)
					client.setQueryData(
						queryKey.getUserBookData(new_data.book_id),
						() => {
							return new_data;
						}
					);
			}
		};
	});
}
/**
 * @param book data
 * @return search a specific book by book title and author
 */
export function useUpdateShelvedBooks() {
	return createMutation(() => {
		return {
			mutationFn: async (props: any) => {
				const res = await client.rest.api.books.protected.update_shelf.$post({
					json: props
				});
				const a = responseUnwrap(res);

				return props;
			},
			onSuccess: (v) => {
				// queryClient.setQueryData(queryKey.getShelvedBookAll(), () => {
				// 	//v.books = v.books.filter((v) => v.is_shelved);
				// 	return v;
				// });
			}
		};
	});
}
