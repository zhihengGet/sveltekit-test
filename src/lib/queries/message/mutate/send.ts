import { client } from '$lib/queries/api';
import { responseUnwrap } from '$lib/queries/util';
import {
	message_types,
	type followerMessages
} from '$lib/schema/messageSchemas';
import { user } from '$lib/state/runes.svelte';
import { createMutation } from '@tanstack/svelte-query';

export function useSendFollowerMessage() {
	return createMutation(() => { return {
		mutationFn: async (args: followerMessages['messages']) => {
			const r =
				await client.rest.api.message.protected.create.follower.message.$post({
					json: {
						type: 'follower',
						messages: args
					}
				});
			return responseUnwrap(r);
		}
	} });
}
export function useSendMessageForBookVisitor() {
	return createMutation(() => { return {
		mutationFn: async (args: {
			message: string;
			book_id: string;
			exp: number;
		}) => {
			const r = await client.rest.api.message.protected.author.message.$post({
				json: {
					message: args.message,
					exp: args.exp,
					book_id: args.book_id
				}
			});
			return responseUnwrap(r);
		}
	} });
}
export function useRemoveMessageForBookVisitor() {
	return createMutation(() => { return {
		mutationFn: async (args: { book_id: string }) => {
			const r = await client.rest.api.message.protected.author.message.$delete({
				json: {
					book_id: args.book_id
				}
			});
			return responseUnwrap(r);
		}
	} });
}
