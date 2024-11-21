import { createQuery } from '@tanstack/svelte-query';
import type { review } from '$lib/types';
import type { paginateQuery } from '$lib/types/pagination';
import { user } from '$lib/state/runes.svelte';
import { responseUnwrap } from '../util';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { queryKey } from '../constants';

export function useGetUserReviews(props: () => paginateQuery<review>) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getUserReviews(props()),
			queryFn: async () => {
				return await responseUnwrap(
					await client.rest.api.reviews.protected.user_reviews.$post({
						json: props()
					})
				);
			},
			staleTime: 10000,
			enabled: () => user.authStatus === 'signed in'
		};
	});
}
export function useGetUserReviewCount() {
	return createQuery(() => {
		return {
			queryKey: queryKey.getUserReviewCount(),
			queryFn: async () => {
				const a =
					await client.rest.api.reviews.protected.user_reviews.count.$get();

				const res = await a.json();
				if (a.status != 200) {
					throw new CustomError('Error Fetching review count');
				}
				return res;
			},
			staleTime: 1000,
			enabled: () => user.authStatus === 'signed in'
		};
	});
}

export function useGetReviews(props: () => paginateQuery<review>) {
	return createQuery(() => ({
		queryKey: queryKey.getReviews(props()),
		queryFn: async () => {
			return await responseUnwrap(
				await client.rest.api.reviews.reviews.$post({ json: props() })
			);
		},
		staleTime: 50000
	}));
}
