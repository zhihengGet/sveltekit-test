import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { matchPartialJson, responseUnwrap } from '../util';
import { queryKey } from './../constants';
import type { InferRequestType } from 'hono';
const createpost = client.rest.api.comments.protected.create.$post;
export async function create(
	data: InferRequestType<typeof createpost>['json']
) {
	console.log('create comment');
	//const uid = await getUserIDFromLocalStorage();
	if (!data.chapter_id || !data.section_id || !data.book_id) {
		throw new CustomError('missing id; Client Error');
	}
	const info = await client.rest.api.comments.protected.create.$post({
		json: data
	});

	return responseUnwrap(info);
}
export type getComment = {
	paragraphID: string;
	chapterID: number;
	commentID: number | null;
};
export function useCreateComment() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: create,
		onSuccess: (data) => {
			client.setQueriesData(
				{
					predicate: (query) => {
						return matchPartialJson(
							query.queryKey,
							queryKey.getUserComment({
								section_id: data.section_id,
								parent_id: data.parent_id
							})
						);
					}
				},
				() => {
					return data;
				}
			);
		}
	} });
}
/* export function useUpdate() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: create,
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ['getComments'] });
		}
	} });
} */
