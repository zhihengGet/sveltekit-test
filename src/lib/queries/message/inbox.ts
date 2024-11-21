import {
	createMutation,
	createQuery,
	type CreateMutationResult
} from '@tanstack/svelte-query';
import { client } from '../api';
import { responseUnwrap } from '../util';
import type { message_types } from './constants';

export function useGetMessageReadOrNot() {
	return createQuery(() => {
		return {
			queryKey: ['inbox', 'read or not'],
			queryFn: async () => {
				return responseUnwrap(
					await client.rest.api.message.protected.inbox.data.$get()
				);
			}
		};
	});
}
const markPost = client.rest.api.message.protected.inbox.mark.read.$post;
export function useMarkMessageRead() {
	return createMutation(() => { return {
		mutationFn: async (arg?: Parameters<typeof markPost>[0]['json']) => {
			return responseUnwrap(
				await client.rest.api.message.protected.inbox.mark.read.$post({
					json: arg ?? { follower: { last_open_date: new Date().getTime() } }
				})
			);
		}
	} });
}
function mark_read(args: {
	type: message_types;
	mutation: CreateMutationResult;
}) {
	args.mutation.mutate({});
}
