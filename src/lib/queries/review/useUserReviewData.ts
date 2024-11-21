import { queryKey, TABLES } from '$lib/queries/constants';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { getLocalUser } from '$lib/queries/user';
import type { reviewWithUserInfo, user_review_data } from '$lib/types';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { unstatAll } from '../util';
const table = TABLES.user_review_data;
/* async function get(reviewID: number) {
	const userID = (await supabase.auth.getUser()).data.user?.id;
	if (!userID) throw { message: 'not logged in' };
	const { data, error } = await supabase
		.from(table)
		.select()
		.match({ review_id: reviewID, user_id: userID })
		.maybeSingle();

	if (error) throw error;

	return data;
} */

async function update(
	props: Parameters<
		typeof client.rest.api.reviews.protected.update_user_info.$post
	>[0]['json']
) {
	console.log('update user review data', props.is_like);
	const userID = (await getLocalUser()).id;
	const r = await client.rest.api.reviews.protected.update_user_info.$post({
		json: props
	});
	const res = await r.json();
	if (r.status !== 200) {
		throw new CustomError(res.message);
	}
	console.log('update user review data', res);

	return { ...res, user_id: userID, review_id: props.id };
}

/* export function useGetUserReviewData({ review_id }: { review_id: number }) {
	const uid = getLocalUser();
	return createQuery({
		queryKey: queryKey.getUserReviewData(review_id),
		queryFn: () => get(review_id),
		enabled: !!uid
	});
}
 */
export function useUpdateUserReviewData() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		onSuccess: (data) => {
			client.setQueriesData(
				{
					predicate: (query) => {
						if (
							query.queryKey.includes('review') &&
							query.queryKey.includes('user_review_data')
						) {
							return true;
						}
						return false;
					}
				},
				(old: reviewWithUserInfo[] | reviewWithUserInfo | null | undefined) => {
					if (!old) return;
					if (Array.isArray(old) === false) {
						if (old.id == data.review_id) {
							old.user_review_data = [data];
						}
					} else
						for (const review of old)
							if (review.id == data.review_id) {
								review.user_review_data = [data];
							}

					return unstatAll(old);
				}
			);
			client.setQueryData(queryKey.getUserReviewData(data.review_id), () => {
				return data;
			});
		}
	} });
}
