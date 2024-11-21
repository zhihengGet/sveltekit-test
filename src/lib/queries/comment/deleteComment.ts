import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { comment } from '$lib/types';
import { queryKey } from '..';
import { currentComment } from '../../../routes/(main)/reader/[book_id]/[chapter_id]/store.svelte';
import { client } from '../api';
import { responseUnwrap } from '../util';

export async function del(props: Pick<comment, 'id'>) {
	const data = await client.rest.api.comments.protected.delete_comment.$delete({
		query: { comment_id: props.id }
	});

	return responseUnwrap(data);
}
export type getComment = {
	paragraphID: string;
	chapterID: number;
	commentID: number | null;
};

export function useDeleteComment() {
	const queryClient = useQueryClient();

	return createMutation(() => { return {
		mutationFn: del,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKey.getUserComment(currentComment.filter)
			});
		}
	} });
}
