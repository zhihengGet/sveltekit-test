import type { book } from '$lib/types';
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { queryKey } from '../constants';
import { client } from '../api';
import { responseUnwrap } from '../util';

const create = client.rest.api.books.protected.create_book.$post;
/**
 * @description create books
 * @param props  Omit<book, 'id' | 'secret_key'> & { secret_key?: string; name: string }
 * @returns book
 */
export async function createBook(props: Parameters<typeof create>[0]['json']) {
	const data = await create({ json: props });
	// update cover url

	return responseUnwrap(data);
}

export function useCreateBook() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: createBook,
		onSuccess: (v) => {
			client.setQueryData<book[]>(queryKey.getAllAuthoredBooks(), (old) => {
				if (old) {
					return [v].concat(old);
				}
				return [v];
			});
		}
	} });
}
