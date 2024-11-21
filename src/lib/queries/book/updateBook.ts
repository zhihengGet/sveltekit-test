import type { book } from '$lib/types';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';
import { pick } from 'lodash-es';
import { client } from '../api';
import queryClient from '../client';
import { queryKey } from '../constants';
import { debouncePromise, disjoint, responseUnwrap } from '../util';
import { bookUpdateFields } from './fields';
const deb = debouncePromise(checkTitle, 500);
const cache = new Map();
export async function debouncedCheckTitle(str: string) {
	if (cache.has(str)) return cache.get(str);

	return deb(str);
}

export async function checkTitle(
	str: string,
	resolve?: (r: boolean) => unknown
) {
	const count = await client.rest.api.books.check_title.$get({
		query: { title: str }
	});
	const ret = await count.json();
	if (count.status !== 200) {
		resolve?.(true);
		return true;
	}
	if (ret) {
		resolve?.(true);
		return true;
	}
	resolve?.(false);
	return false;
}
const update = client.rest.api.books.protected.update_book.$post;
export async function updateBook(props: {
	new_book: Partial<book>;
	old: book;
}) {
	props.new_book = pick(props.new_book, bookUpdateFields);
	const disjoin = disjoint(props.new_book, props.old);
	console.log('update your books', props.new_book, props.old, disjoin);
	if (Object.keys(disjoin).length == 0) {
		console.log('new book info is same as old book, skip update', disjoin);
		return null;
	}
	if (!props.old.id) {
		throw new Error('missing id in old book');
	}
	disjoin.id = props.old.id;
	const data = await update({ json: disjoin });
	return responseUnwrap(data);
}

export function useUpdateBook() {
	const queryClient = useQueryClient();
	return createMutation(() => { return {
		mutationFn: updateBook,
		onSuccess: (disjoin) => {
			if (!disjoin) return;
			queryClient.setQueriesData(
				{
					predicate: (v) => {
						return v.queryKey.includes('book') && !v.queryKey.includes('count');
					}
				},
				(v: book | book[]) => {
					console.log(v, disjoin);
					if (Array.isArray(v)) {
						for (let x of v) {
							if (x.id === disjoin.id) {
								Object.assign(x, disjoin);
								return JSON.parse(JSON.stringify(v));
							}
						}
					} else {
						if (typeof v === 'object' && v.id === disjoin.id)
							return JSON.parse(JSON.stringify({ ...v, ...disjoin }));
					}
					return v;
				}
			);
		},
		meta: { toast: true, message: 'Book Updated' }
	} });
}

export function updateBookQueryCache(new_book: Partial<book>) {
	queryClient.setQueryData(
		[queryKey.getAuthoredBooks()],
		(v: undefined | book[]) => {
			if (v) {
				v.forEach((v) => {
					if (v.id == new_book.id) {
						Object.assign(v, new_book);
					}
				});
			}
			return v;
		}
	);
}
