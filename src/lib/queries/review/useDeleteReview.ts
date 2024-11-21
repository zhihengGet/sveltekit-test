/* eslint-disable @typescript-eslint/ban-ts-comment */
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { review } from '$lib/types';
import { getLocalUser } from '../user';
import { client } from '../api';
import { responseUnwrap } from '../util';

async function deleteReview(props: Pick<review, 'id'>) {
	const uid = (await getLocalUser()).id;
	const data = await client.rest.api.reviews.protected.delete_review.$delete({
		json: { id: props.id }
	});
	return responseUnwrap(data);
}

export function useDeleteReview() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: deleteReview,
		onSuccess: () => {
			client.invalidateQueries({
				predicate: (query) => {
					//@ts-ignore
					return query.queryKey[0].toLowerCase().includes('review');
				}
			});
		}
	} });
}
