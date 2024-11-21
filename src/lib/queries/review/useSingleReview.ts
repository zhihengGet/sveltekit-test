import { queryKey } from '$lib/queries/constants';
import { createQuery as useQuery } from '@tanstack/svelte-query';
import { user } from '$lib/state/runes.svelte';
import { responseUnwrap } from '../util';
import { client } from '../api';

export function useGetUserReview(props: () => number) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getUserReview(props()),
			queryFn: async () => {
				return await responseUnwrap(
					await client.rest.api.reviews.protected.user_review.$get({
						query: { book_id: props() + '' }
					})
				);
			},
			enabled: typeof props() !== undefined && user.authStatus === 'signed in'
		};
	});
}
export function useGetReview(props: () => number | string) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getReview(props()),
			queryFn: async () => {
				if (props() == undefined) {
					return null;
				}
				return await responseUnwrap(
					await client.rest.api.reviews.review.$get({
						query: { review_id: props() + '' }
					})
				);
			},
			enabled: typeof props() != 'undefined' && user.authStatus === 'signed in'
		};
	});
}
