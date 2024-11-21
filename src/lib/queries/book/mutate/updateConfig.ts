import { client } from '$lib/queries/api';
import { responseUnwrap } from '$lib/queries/util';
import { createMutation } from '@tanstack/svelte-query';
import type { InferRequestType } from 'hono';

export function useUpdateBookConfig() {
	return createMutation(() => { return {
		mutationKey: ['book config update'],
		mutationFn: async (
			data: InferRequestType<
				typeof client.rest.api.books.protected.author_book_setting.$post
			>['json']
		) => {
			const info =
				await client.rest.api.books.protected.author_book_setting.$post({
					json: data
				});
			return responseUnwrap(info);
		},
		meta: {
			toast: true
		}
	} });
}
