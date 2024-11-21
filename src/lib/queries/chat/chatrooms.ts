import { createQuery } from '@tanstack/svelte-query';
import { queryKey } from '../constants';
import { client } from '../api';
import type { InferRequestType } from 'hono';
import { responseUnwrap } from '../util';
import type { chatrooms, paginateQuery } from '$lib/types';

export function useGetPublicChatrooms(args: () => paginateQuery<chatrooms>) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getPublicChatroom(args()),
			queryFn: async () => {
				const data =
					await client.rest.api.chatter.protected.list.public.rooms.$post({
						json: args()
					});

				return responseUnwrap(data);
			}
		};
	});
}
