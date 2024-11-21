import { currentComment } from '$lib/../routes/(main)/reader/[book_id]/[chapter_id]/store.svelte';
import { queryKey } from '$lib/queries/constants';
import { user } from '$lib/state/runes.svelte';
import type { comment, paginateQuery } from '$lib/types';
import { createQuery } from '@tanstack/svelte-query';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { getPreviewSessionIdAsync } from '../preview/usePreview';
import { responseUnwrap } from '../util';

export type getComment = {
	/**
	 * @description undefined means get all comment, null means when it is top-level comment , root comment
	 */
	section_id: string | null;
	/**
	 * @description get the comment which has this id as parent_id
	 */
	parent_id: number | null;
	chapter_id: number | null;
	user_id?: string;
};

export type getUserComment = {
	section_id?: string | undefined;
	parent_id?: string | null;
	chapter_id?: number;
	book_id?: string;
};

export function useGetComments() {
	return createQuery(() => {
		return {
			queryKey: queryKey.getComments(currentComment),
			queryFn: async () => {
				// for preview chapter, only get draft chapter's comment
				currentComment.filter.preview_session = (
					(await getPreviewSessionIdAsync()) || undefined
				).id;
				const a = await client.rest.api.comments.protected.comments.$post({
					json: currentComment
				});
				return responseUnwrap(a);
			},
			staleTime: 10000,
			enabled: () =>
				!!currentComment.filter.section_id &&
				currentComment.filter.chapter_id != null //get all user comment or only one comment
		};
	});
}
// get logged in user or other user
// get all user comments for this section/paragraph
export function useGetUserComment(
	props: () => Parameters<
		typeof client.rest.api.comments.protected.user_comment.$get
	>[0]['query']
) {
	return createQuery(() => ({
		queryKey: queryKey.getUserComment(props()),
		queryFn: async () => {
			const a = await client.rest.api.comments.protected.user_comment.$get({
				query: props()
			});
			return await responseUnwrap(a);
		},
		enabled:
			!!props().chapter_id &&
			!!props().book_id &&
			!!props().section_id &&
			user.authStatus == 'signed in'
	}));
}
// all user comments
export function useGetUserComments(data: () => paginateQuery<comment>) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getUserComments(data()),
			queryFn: async () => {
				const b = await client.rest.api.comments.protected.user_comments.$post({
					json: data()
				});
				return await responseUnwrap(b);
			}
		};
	});
}
// get all user comments for this section/paragraph
export function useGetUserCommentCount(arg: () => string) {
	return createQuery(() => ({
		queryKey: queryKey.getUserCommentsCount(arg()),
		queryFn: async () => {
			const b =
				await client.rest.api.comments.protected.user_comments.count.$get({
					query: { user_id: arg() }
				});
			return await responseUnwrap(b);
		}
	}));
}

export function useGetHasUnreadReplies() {
	return createQuery(() => ({
		queryKey: queryKey.unReadCommentCount(),
		queryFn: async () => {
			const data = await client.rest.api.comments.protected.hasunread.$get();

			return await responseUnwrap(data);
		},
		enabled: user.authStatus === 'signed in'
	}));
}

// get a single comment
/* export async function getComment({ comment_id }: commentProp) {
	const { data, error } = await supabase
		.from('comments')
		.select(
			comment_field + ',user_comment_data(' + user_comment_data_fields + ')'
		)
		.eq('id', comment_id)
		.single();
	if (error) throw error;
	return data;
} */
// get parent comment for we going back
export function useGetParentComment() {
	return createQuery(() => ({
		queryKey: queryKey.getComment(currentComment.filter),
		queryFn: async () => {
			if (!currentComment.filter.parent_id)
				throw new CustomError('missing comment_id');
			const data = await client.rest.api.comments.protected.comment.$get({
				query: { id: currentComment.filter.parent_id + '' }
			});
			return responseUnwrap(data);
		},
		enabled: () => !!currentComment.filter.parent_id
	}));
}
// all user comments
export function useGetBookComments(data: () => paginateQuery<comment>) {
	return createQuery(() => ({
		queryKey: queryKey.getUserComments(data()),
		queryFn: async () => {
			const b = await client.rest.api.comments.protected.book_comments.$post({
				json: data()
			});
			return await responseUnwrap(b);
		}
	}));
}
