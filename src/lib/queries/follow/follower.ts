import { createMutation, createQuery } from '@tanstack/svelte-query';
import { client } from '../api';
import { responseUnwrap } from '../util';

export function useGetFollower() {
	return createQuery(() => {});
}
let ac = client.rest.api.follow.protected.subscribe.$post;
export function useAddFollower() {
	return createMutation(() => { return {
		mutationFn: async (args: { user_id: string; is_follow: boolean }) => {
			const data = await client.rest.api.follow.protected.subscribe.$post({
				json: args
			});
			return responseUnwrap(data);
		}
	} });
}
export function useRemoveFollower() {
	return createMutation(() => { return {
		mutationFn: async (args: { user_id: string }) => {
			const data = await client.rest.api.follow.protected.unsubscribe.$post({
				json: { user_id: args.user_id }
			});
			return responseUnwrap(data);
		}
	} });
}
