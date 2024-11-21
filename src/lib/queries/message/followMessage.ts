import { createQuery } from '@tanstack/svelte-query';
import { client } from '../api';
import { responseUnwrap } from '../util';
import type { followerMessages } from '$lib/schema/messageSchemas';
import type { message_types } from './constants';
import { sortBy } from 'lodash-es';
import { user } from '$lib/state/runes.svelte';
/* get data from all subscribed  */
export function useGetAllFollowerMessageListForUser() {
	return createQuery(() => {
		return {
			queryKey: ['follower', 'message'],
			queryFn: async () => {
				const r =
					await client.rest.api.message.protected.follower.messages.$get();

				return responseUnwrap(r);
			},
			enabled: !!user.id
		};
	});
}
// includes site
export function useGetAllMessageForUser() {
	return createQuery(() => {
		return {
			queryKey: ['site', 'follower', 'message'],
			queryFn: async () => {
				const r = await client.rest.api.message.protected.all.messages.$get();

				return responseUnwrap(r);
			}
		};
	});
}
/* get data from one author */
export function useGetMessageFromAuthorToFollower(props: () => string) {
	return createQuery(() => {
		return {
			queryKey: ['follower', 'message', props()],
			queryFn: async () => {
				const r = await client.rest.api.message.protected.follower.message.$get(
					{ query: { id: props() } }
				);
				return responseUnwrap(r);
			}
		};
	});
}
export function useGetMessageForBookVisitor(props: () => string) {
	return createQuery(() => {
		return {
			queryKey: ['book', 'message', props()],
			queryFn: async () => {
				const r = await client.rest.api.message.protected.author.message.$get({
					query: { book_id: props() }
				});
				return responseUnwrap(r);
			},
			enabled: !!props()
		};
	});
}
export function useGetSiteMessages() {
	return createQuery(() => {
		return {
			queryKey: ['site', 'message'],
			queryFn: async () => {
				const r = await client.rest.api.message.protected.site.messages.$get(
					{}
				);
				return responseUnwrap(r);
			}
		};
	});
}
export function messageFollowerProcess({
	messages,
	type = 'follower'
}: {
	messages: followerMessages['messages'];
	type: message_types;
}) {
	let unread_count = 0;
	let followee: { [s in string]: { total_message: number; unread_count: 0 } } =
		{};
	for (let x of messages) {
		if (x.author_id) {
			if (!followee[x.author_id]) {
				followee[x.author_id] = {
					total_message: 0,
					unread_count: 0
				};
			}
			followee![x.author_id]!['total_message'] += 1;
			followee![x.author_id]!['unread_count'] += x.is_read ? 0 : 1;
		}
	}
	//let grouped = groupBy(messages, (v) => v.author_id);
	return {
		messages: sortBy(messages, (v) => -v.created_at),
		unread_count,
		total_message: messages.length,
		followee
	};
}
