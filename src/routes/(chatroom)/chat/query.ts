import { client } from '$lib/queries/api';
import queryClient from '$lib/queries/client';
import { responseUnwrap } from '$lib/queries/util';
import {
	createMutation,
	createQueries,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { chatStore, type IncomingMessages } from './store.svelte';
import localforage from 'localforage';
import type { InferRequestType } from 'hono';
import { stringify } from 'devalue';
import type { paginateQuery, user_chatroom_data } from '$lib/types';

const createRoom = client.rest.api.chatter.protected.create.chatroom.$post;
const updateRoom = client.rest.api.chatter.protected.chatroom.$patch;
export const queryKey = {
	getRoomList: () => ['room list'],
	getUserEvent: (user: string) => ['user event', user],
	getUsers: (room_id: string) => ['roommates', room_id],
	getAnnouncement: (room_id: string) => ['announcement', room_id],
	getBanned: (args: () => any) => ['banned', args()],
	getResources: (args: () => string) => ['resources', args()],
	get: (args: () => any) => ['banned', args()]
};
export function useCreateRoom() {
	return createMutation(() => {
		return {
			mutationFn: async (args: {
				description: string;
				name: string;
				secret: string;
				allow_join: boolean;
			}) => {
				const r = await createRoom({
					json: args
				});
				return responseUnwrap(r);
			},
			meta: {
				toast: true
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: queryKey.getRoomList() });
			}
		};
	});
}
export function useUpdateRoom() {
	return createMutation(() => {
		return {
			mutationFn: async (args: {
				description: string;
				name: string;
				secret: string;
				allow_join: boolean;
				room_id: string;
			}) => {
				const r = await client.rest.api.chatter.protected.chatroom.$patch({
					json: {
						description: args.description,
						name: args.name,
						secret: args.secret,
						allow_join: args.allow_join,
						room_id: args.room_id,
						...args
					}
				});
				return responseUnwrap(r);
			},
			meta: {
				toast: true
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['room list'] });
			}
		};
	});
}
export function useRoomTransferOwnership() {
	return createMutation(() => {
		return {
			mutationFn: async (args: { new_owner: string; room_id: string }) => {
				const r =
					await client.rest.api.chatter.protected.transfer.ownership.$patch({
						json: {
							new_owner: args.new_owner,
							room_id: args.room_id
						}
					});
				return responseUnwrap(r);
			},
			meta: {
				toast: true
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['room list'] });
			}
		};
	});
}
export function useGetRoomList() {
	return createQuery(() => {
		return {
			queryKey: queryKey.getRoomList(),
			queryFn: async () => {
				const r = await client.rest.api.chatter.protected.chatrooms.$get();
				return responseUnwrap(r);
			}
		};
	});
}
export function useGetRoommates(args: () => undefined | string) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getUsers(args()),
			queryFn: async () => {
				const r = await client.rest.api.chatter.protected[
					':room_id'
				].roommates.$get({
					param: {
						room_id: args()
					}
				});
				return responseUnwrap(r);
			},
			enabled: !!args()
		};
	});
}
export function useCreatePinMessage() {
	return createMutation(() => {
		return {
			mutationFn: async (args: { description: string; name: string }) => {
				const r = await client.rest.api.chatter.protected.create.chatroom.$post(
					{
						json: { description: args.description, name: args.name }
					}
				);
				return responseUnwrap(r);
			}
		};
	});
}
/**
 * @description directly set with DO
 * @param ws
 * @param msg
 */
export const sendSetAnnouncement = async (
	ws: WebSocket,
	msg: IncomingMessages['announce']
) => {
	ws.send(stringify({ announce: msg }));
};

const announce = client.rest.api.chatter.protected.announce.$post;
/**
 * @deprecated instead of setting this through http+DO RPC, we use ws
 * @description directly set with DO
 * @param ws
 * @param msg
 */
export function useCreateAnnouncement() {
	return createMutation(() => {
		return {
			mutationFn: async (args: InferRequestType<typeof announce>['json']) => {
				const r = await announce({
					json: args
				});
				return responseUnwrap(r);
			}
		};
	});
}
export function useKickUser() {
	const queryClient = useQueryClient();
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.kick.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.kick.$post({
					json: args
				});
				return responseUnwrap(r);
			},
			onSuccess: (e) => {
				queryClient.invalidateQueries({
					queryKey: queryKey.getUsers(chatStore.selectedChat?.room_id)
				});
			}
		};
	});
}
export function useMute() {
	const queryClient = useQueryClient();
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.mute.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.mute.$post({
					json: {
						mute_duration: args.mute_duration,
						room_id: args.room_id,
						start_date: args.start_date,
						user_id: args.user_id,
						reason: args.reason
					}
				});
				return responseUnwrap(r);
			},
			onSuccess: (e) => {
				// if we invalidate we lose the user status
				queryClient.invalidateQueries({
					queryKey: queryKey.getUsers(chatStore.selectedChat?.room_id)
				});
			}
		};
	});
}
export function useUnmute() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.unmute.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.unmute.$post({
					json: args
				});
				return responseUnwrap(r);
			},
			onSuccess: (e) => {
				queryClient.invalidateQueries({
					queryKey: queryKey.getUsers(chatStore.selectedChat?.room_id)
				});
			},
			meta: {
				toast: true
			}
		};
	});
}
export function useDeleteRoom() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.chatroom.$delete
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.chatroom.$delete({
					json: {
						room_id: args.room_id
					}
				});
				return responseUnwrap(r);
			},
			meta: {
				toast: true,
				toastMessage: 'room deleted'
			}
		};
	});
}
export function useArchiveRoom() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.archive.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.archive.$post({
					json: {
						room_id: args.room_id
					}
				});
				return responseUnwrap(r);
			}
		};
	});
}

export function usePromoteUser() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.mod.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.mod.$post({
					json: args
				});
				return responseUnwrap(r);
			}
		};
	});
}
export function useQuit() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.quit.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.quit.$post({
					json: {
						room_id: args.room_id
					}
				});
				return responseUnwrap(r);
			}
		};
	});
}
export function useMuteAll() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.mute_room.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.mute_room.$post({
					json: args
				});
				return responseUnwrap(r);
			}
		};
	});
}

export function useBanUser() {
	const client1 = useQueryClient();
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.ban.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.ban.$post({
					json: {
						room_id: args.room_id,
						reason: args.reason,
						user_id: args.user_id
					}
				});
				return responseUnwrap(r);
			},
			meta: {
				toast: true,
				toastMessage: 'User Banned'
			},
			onSuccess: () => {
				client1.invalidateQueries({
					queryKey: queryKey.getBanned(() => {}).slice(0, 1)
				});
			}
		};
	});
}
// export function useGetBanUser(
// 	args: () => Parameters<
// 		typeof client.rest.api.chatter.protected.list.ban.$get
// 	>[0]['query']
// ) {
// 	return createQuery(() => {
// 		return {
// 			queryKey: [args()],
// 			queryFn: async () => {
// 				const r = await client.rest.api.chatter.protected.banned.$get({
// 					query: args()
// 				});
// 				return responseUnwrap(r);
// 			}
// 		};
// 	});
// }
export function useUpdateRole() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.mod.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.mod.$post({
					json: args
				});
				return responseUnwrap(r);
			}
		};
	});
}
export function useUnbanUser() {
	const client1 = useQueryClient();
	return createMutation(() => {
		return {
			mutationFn: async (
				args: Parameters<
					typeof client.rest.api.chatter.protected.unban.$post
				>[0]['json']
			) => {
				const r = await client.rest.api.chatter.protected.unban.$post({
					json: args
				});
				return responseUnwrap(r);
			},
			onSuccess: () => {
				client1.invalidateQueries({ queryKey: ['banned'] });
			},
			meta: {
				toast: true,
				toastMessage: 'Unbaned !'
			}
		};
	});
}
export function useGetBannedUsers(
	args: () => paginateQuery<user_chatroom_data> /* Parameters<
		typeof client.rest.api.chatter.protected.banned.users.$post
	>[0]['json'] */
) {
	return createQuery(() => {
		return {
			queryKey: ['banned', args()],
			queryFn: async () => {
				const r = await client.rest.api.chatter.protected.banned.users.$post({
					json: args()
				});
				return responseUnwrap(r);
			}
		};
	});
}
export function useGetUserEvents(
	args: () => { room_id: string; user_id: string }
) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getUserEvent(args().user_id),
			queryFn: async () => {
				const r = await client.rest.api.chatter.protected.user.events.$get({
					query: { room_id: args().room_id }
				});
				return responseUnwrap(r);
			}
		};
	});
}

export function isUserMessage(
	a: IncomingMessages
): a is NonNullable<{ message: NonNullable<IncomingMessages['message']> }> {
	return !!a['message'];
}

const ANNOUNCEMENT = (data: number) => 'hide announcement ' + data;
export function useHideAnnouncement() {
	return createMutation(() => {
		return {
			mutationFn: async (
				announcement: NonNullable<IncomingMessages['announce']>
			) => {
				await localforage.setItem(
					ANNOUNCEMENT(announcement.created_at),
					'hidden'
				);
				return true;
			},
			meta: {
				toast: true,
				toastMessage: 'Announcement hidden!'
			}
		};
	});
}
export function useShouldShowAnnouncement(
	args: () => { announcement?: NonNullable<IncomingMessages['announce']> }
) {
	return createQuery(() => {
		return {
			queryKey: [
				'check visibility announcement',
				args().announcement?.created_at
			],
			queryFn: async () => {
				if (!args().announcement) return true;
				const r = await localforage.getItem(
					ANNOUNCEMENT(args().announcement?.created_at)
				);
				return !r;
			}
		};
	});
}
export function useSendAnnouncement(
	args: () => { announcement?: NonNullable<IncomingMessages['announce']> }
) {
	return createQuery(() => {
		return {
			queryKey: [
				'check visibility announcement',
				args().announcement?.created_at
			],
			queryFn: async () => {
				if (!args().announcement) return false;
				const r = await localforage.getItem(
					ANNOUNCEMENT(args().announcement?.created_at)
				);
				return !r;
			}
		};
	});
}
export function useGetAnnouncement(args: () => { room_id: string }) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getAnnouncement(args().room_id),
			queryFn: async () => {
				const data = await client.rest.api.chatter.protected.announce.$get({
					query: { room_id: args().room_id }
				});
				return responseUnwrap(data);
			},
			enabled: !!args().room_id
		};
	});
}
export function useJoinRoom() {
	return createMutation(() => {
		return {
			mutationFn: async (args: { room_id: string; secret: string }) => {
				const data = await client.rest.api.chatter.protected.join.$post({
					json: { room_id: args.room_id, secret: args.secret }
				});
				return responseUnwrap(data);
			}
		};
	});
}
export function useUpdateUser() {
	return createMutation(() => {
		return {
			mutationFn: async (args: {
				room_id: string;
				name: string;
				description: string;
			}) => {
				const data = await client.rest.api.chatter.protected.update.user.$post({
					json: args
				});
				return responseUnwrap(data);
			}
		};
	});
}
export function useAddResources() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: InferRequestType<
					typeof client.rest.api.chatter.protected.resources.$post
				>['json']
			) => {
				const data = await client.rest.api.chatter.protected.resources.$post({
					json: args
				});
				return responseUnwrap(data);
			}
		};
	});
}
export function useDeleteResources() {
	return createMutation(() => {
		return {
			mutationFn: async (
				args: InferRequestType<
					typeof client.rest.api.chatter.protected.resources.$delete
				>['json']
			) => {
				const data = await client.rest.api.chatter.protected.resources.$delete({
					json: args
				});
				return responseUnwrap(data);
			}
		};
	});
}
export function usGetResources(args: () => string) {
	return createQuery(() => ({
		queryKey: queryKey.getResources(args),
		queryFn: async () => {
			const data = await client.rest.api.chatter.protected.resources[
				':room_id'
			].$get({
				param: { room_id: args() }
			});
			return responseUnwrap(data);
		},
		enabled: !!args()
	}));
}
export function usGetUserActivities(args: () => string) {
	return createQuery(() => ({
		queryKey: queryKey.getResources(args),
		queryFn: async () => {
			const data = await client.rest.api.self.protected.activities.$get();
			return responseUnwrap(data);
		},
		enabled: !!args()
	}));
}
export function usGetUsersActivities(args: () => string) {
	return createQuery(() => ({
		queryKey: queryKey.getResources(args),
		queryFn: async () => {
			const data = await client.rest.api.self.protected.activities.$get();
			return responseUnwrap(data);
		},
		enabled: !!args()
	}));
}

export function useGetUserActivities() {
	const data = createQueries({
		queries: () => {
			return (
				users?.map((v) => {
					return {
						queryKey: ['activities', v.user_id],
						queryFn: async () => {
							const res = await client.rest.api.self.protected.activities[
								':user'
							].$get({
								param: { user: v.user_id }
							});
							/* if(res.status!==00) {
					throw new CustomError("")
				} */
							return responseUnwrap(res);
						}
					};
				}) || []
			);
		},
		combine: (results) => {
			return {
				data: results.map((result) => result.data),
				pending: results.some((result) => result.isPending)
			};
		}
	});
}

export function useGetChatInbox() {
	return createQuery(() => {
		return {
			queryKey: ['inbox', 'chat'],
			queryFn: async () => {
				const res = await client.rest.api.chatter.protected.inbox.$get();
				return responseUnwrap(res);
			}
		};
	});
}
export function useClearChatInboxRead() {
	return createMutation(() => {
		return {
			mutationFn: async () => {
				const res = await client.rest.api.chatter.protected.clear.$delete();
				return responseUnwrap(res);
			}
		};
	});
}
