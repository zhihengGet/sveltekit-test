import type { min_chapter, paginateQuery } from '$lib/types';
import { createQuery } from '@tanstack/svelte-query';
import { client } from '../api';
import { responseUnwrap } from '../util';

export function useGetBookmarkChapters(args: () => paginateQuery<min_chapter>) {
	return createQuery(() => {
		return {
			queryKey: ['bookmark', args()],
			queryFn: async () => {
				const data =
					await client.rest.api.chapters.protected.bookmark_notes.$post({
						json: args()
					});
				return responseUnwrap(data);
			}
		};
	});
}
export function useGetBookmarkChaptersCount(
	props: () => paginateQuery<min_chapter>
) {
	return createQuery(() => {
		return {
			queryKey: ['bookmark', 'count', props()],
			queryFn: async () =>
				responseUnwrap(
					await client.rest.api.chapters.protected.bookmark.count.$post({
						json: props()
					})
				)
		};
	});
}
