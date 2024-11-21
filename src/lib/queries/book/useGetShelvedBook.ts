/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
import { isDefaultFolder } from '$components/folders/folderUtils';
import type {
	book,
	bookWithUserInfo,
	paginateQuery,
	user_book_data
} from '$lib/types';
import { createQuery as useQuery } from '@tanstack/svelte-query';
import { getBooks } from '.';
import { CustomError } from '../base/errors';
import { queryKey } from '../constants';
import { getLocalUser } from '../user';
import { client } from '../api';
import type { InferRequestType } from 'hono';
import { responseUnwrap } from '../util';
import { user } from '$lib/state/runes.svelte';
const get = client.rest.api.books.protected.getShelvedBook.$get;
export type shelved_props = InferRequestType<typeof get>['query'];
type props = paginateQuery<book, user_book_data>;

/**
 * @param book data
 * @return search a specific book by book title and author
 */
export function useGetShelvedBooks(props: () => props) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getUserShelvedBook(props()),
			queryFn: async () => {
				const res = await get({
					query: {
						...props().paginate,
						folder: props().join?.filter?.folder ?? '',
						count: 'false'
					}
				});
				return responseUnwrap(res);
			},
			staleTime: 1000 * 60
		};
	});
}
/**
 * @param book data
 * @return number
 */
export function useGetShelvedBooksCount(props: () => props) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getUserShelvedBookCount(props()),
			queryFn: async () => {
				const res = await get({
					query: {
						...props().paginate,
						folder: props().join?.filter?.folder ?? '',
						count: 'true'
					}
				});
				return responseUnwrap(res);
			},
			staleTime: 1000 * 60 * 60
		};
	});
}
/**
 * @param book data
 * @return search a specific book by book title and author
 */
export function useGetShelvedBooksAll(props: () => boolean) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getShelvedBookAll(),
			queryFn: async () => {
				const res = await client.rest.api.books.protected.shelf.books.all.$get({
					query: { refresh: props() + '' }
				});
				return responseUnwrap(res);
			},
			staleTime: 1000 * 60,
			enabled: user.authStatus == 'signed in'
		};
	});
}
