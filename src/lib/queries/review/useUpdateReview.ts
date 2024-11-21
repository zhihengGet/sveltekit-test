/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getLocalUser } from '$lib/queries/user';
import { disjoint, responseUnwrap } from '$lib/queries/util';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import { review_schema } from '$lib/schema/reviewSchema';
import { getUserStoreValue } from '$lib/state/store';
import type { review, reviewWithUserInfo } from '$lib/types';
import { merge } from 'lodash-es';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { queryKey } from '../constants';

async function update(props: {
	new: review | reviewWithUserInfo;
	old: Partial<review>;
}) {
	console.log('update user review', props);
	const userID = (await getLocalUser())?.id;
	const { username, avatar_url } = getUserStoreValue();

	const disjoin = disjoint<Partial<reviewWithUserInfo>>(props.new, props.old);
	if (disjoin.user_review_data) {
		delete disjoin.user_review_data;
	}
	disjoin.user_id = userID;
	disjoin.username = username;
	disjoin.avatar_url = avatar_url;
	disjoin.user_modified_at = new Date().toUTCString();
	const a = review_schema.partial().safeParse(disjoin);
	if (!a.success) throw new CustomError(a.error.message);

	const response = await client.rest.api.reviews.protected.update.$post({
		json: { ...disjoin, book_id: props.new.book_id }
	});
	return responseUnwrap(response);
}

export function useUpdateUserReview() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		meta: { toast: true },
		onSuccess: (v) => {
			if (v) {
				client.setQueryData(queryKey.getUserReview(v.book_id), () => {
					return v;
				});
				client.setQueriesData(
					{ queryKey: queryKey.getUserReviews().slice(0, 4) },
					//@ts-ignore
					(old: review[]) => {
						if (old) {
							const target = old.find((prev) => prev.id === v.id);
							if (target) {
								merge(target, v);
							}
							return JSON.parse(JSON.stringify(old));
						}
					}
				);
			}
		}
	} });
}
