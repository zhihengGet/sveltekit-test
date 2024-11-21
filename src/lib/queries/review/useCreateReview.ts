import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { review } from '$lib/types';

import { loginError } from '../base/errors';
import { queryKey } from '../constants';
import { user } from '$lib/state/runes.svelte';
import { getPublicAvatarUrl } from '../storage/useUpload';
import { client } from '../api';
import { responseUnwrap } from '../util';

async function create(props: Partial<review>) {
	const username = user?.username;
	const uid = user.id;
	if (!uid || !props.book_id) {
		console.error(uid, props.book_id);
		throw loginError;
	}
	const res = await client.rest.api.reviews.protected.create.$post({
		json: {
			content: props.content ?? 'empty',
			book_id: props.book_id,
			title: props.title,
			username: username
		}
	});

	return responseUnwrap(res);
}

export function useCreateReview() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: create,
		onSuccess: (v) => {
			client.invalidateQueries({
				queryKey: queryKey.getUserReviews().filter((v) => !!v)
			});
			client.setQueryData(queryKey.getUserReview(v.book_id), () => {
				return v;
			});
		},
		meta: {
			toast: true
		}
	} });
}
