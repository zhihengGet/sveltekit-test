import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { supabase } from '$lib/supabaseClient/client';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { CustomError } from '$lib/queries/base/errors';
import { DO_GEN, KV } from './utils/kv';
import { DisposeRPC, getChatStub } from './utils/chat';
import { uuidv7 } from 'uuidv7';
import type { chatrooms } from '$lib/types';
import {
	CHATROOM,
	DUMMY_NULL_UUID,
	DUMMY_UUID,
	MAX_CHAT_ROOM_NAME,
	MAX_TOTAL_CHAT_ROOM,
	MAX_USER_CHAT_MESSAGE_LENGTH,
	MAX_USER_CHAT_ROOM
} from '$lib/data/constants';
import { removeNil } from '$lib/queries/util';
import {
	BigIntIdsZod,
	genZodSchema,
	genZodSchemaObject
} from '$lib/schema/querySchema/zodPagination';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { UserEvent } from './utils/user_event';
import type { IncomingMessages } from '$packages/chatroom/src';
import type { room_info } from '../../(chatroom)/chat/store.svelte';
import {
	announcementSchema,
	chatEvents,
	chatResourcesSchema,
	chatroomSchema,
	chatUserSchema,
	type chatEvent,
	type chatResource
} from '$lib/schema/chatSchema';
import { sortBy, uniqBy } from 'lodash-es';
import { paginateSchema } from '$lib/schema/paginate';
import { lastN } from './utils/lib';
import { IsomorphicSanitizer } from '$lib/utils';

type chat_inbox = {
	message: string;
	room_name: string;
	useUpdateUser: string;
	room_id: string;
	title: string;
};

const chatroomCols = [
	'room_id',
	'is_deleted',
	'is_archived',
	'created_at',
	'owner_id',
	'allow_join',
	'name',
	'description'
];

async function setRoomUserInbox({
	requestHandler,
	uid,
	room
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
	room: chat_inbox;
}) {
	const rooms = await getRoomUserInbox({ requestHandler, uid, room });
	rooms.push(room);
	let cleaned = rooms;
	if (rooms.length > 15) {
		//keep last 15
		cleaned = rooms.slice(rooms.length - 15);
	}

	await requestHandler.platform.env.kv_cache.put(
		KV.JOINED_ROOM(uid),
		JSON.stringify(cleaned)
	);
}
async function getRoomUserInbox({
	requestHandler,
	uid,
	room
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
	room: chat_inbox;
}) {
	const data: chat_inbox[] =
		(await requestHandler.platform.env.kv_cache.get(
			KV.CHATROOM_USER_INBOX(room.room_id),
			'json'
		)) ?? [];
	return data;
}
async function updateJoinedRoomKv({
	requestHandler,
	uid,
	new_room
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
	new_room: chatrooms;
}) {
	const rooms = await getJoinedRoomsKV({ requestHandler, uid });
	rooms.push(new_room);
	if (rooms.length > MAX_TOTAL_CHAT_ROOM) {
		return new CustomError(
			'You can only join ' + MAX_TOTAL_CHAT_ROOM + ' Rooms'
		);
	}
	await requestHandler.platform.env.kv_cache.put(
		KV.JOINED_ROOM(uid),
		JSON.stringify(rooms)
	);
}
async function saveJoinedRoomsKV({
	requestHandler,
	uid,
	rooms
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
	rooms: chatrooms[];
}) {
	const d = await requestHandler.platform.env.kv_cache.put(
		KV.JOINED_ROOM(uid),
		JSON.stringify(rooms)
	);

	return rooms;
}
async function getJoinedRoomsKV({
	requestHandler,
	uid
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
}) {
	const rooms: chatrooms[] =
		(await requestHandler.platform.env.kv_cache.get(
			KV.JOINED_ROOM(uid),
			'json'
		)) ?? [];

	return rooms;
}
async function removeRoomKV({
	requestHandler,
	uid,
	room
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	uid: string;
	room: string;
}) {
	const rooms: chatrooms[] = await getJoinedRoomsKV({ requestHandler, uid });
	let cleaned = rooms.filter((v) => v.room_id !== room);
	const d = await requestHandler.platform.env.kv_cache.put(
		KV.JOINED_ROOM(uid),
		JSON.stringify(cleaned)
	);
	return rooms;
}
const resource = new Hono()
	.post(
		'/resources',
		zValidator('json', chatResourcesSchema),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const data: chatResource[] =
				(await requestHandler.platform.env.kv_cache.get(
					KV.CHAT_RESOURCES(query.room_id),
					'json'
				)) ?? [];
			query.id = nanoid(9);
			data.push(query);
			await requestHandler.platform.env.kv_cache.put(
				KV.CHAT_RESOURCES(query.room_id),
				JSON.stringify(data)
			);
			return json(data as unknown as chatResource[]);
		}
	)
	.post(
		'/update/resources',
		zValidator('json', chatResourcesSchema),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			let data: chatResource[] =
				(await requestHandler.platform.env.kv_cache.get(
					KV.CHAT_RESOURCES(query.room_id),
					'json'
				)) ?? [];
			let i = data.findIndex((v) => v.id == query.id);
			if (i != -1) {
				// merge
				let merged = { ...i, ...query };
				data[i] = merged;
			} else {
				data.push(query);
			}
			await requestHandler.platform.env.kv_cache.put(
				KV.CHAT_RESOURCES(query.room_id),
				JSON.stringify(data)
			);
			return json(data as chatResource[]);
		}
	)
	.delete(
		'/resources',
		zValidator(
			'json',
			chatResourcesSchema
				.pick({ id: true, room_id: true })
				.merge(z.object({ delete_all: z.boolean() }))
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			// admin can delete any
			// mod can delete any user or his own
			// user can delete his own
			const user = await supabaseServer()
				.from('chatrooms')
				.select('owner_id,user_chatroom_data!inner(role)')
				.match({ room_id: query.room_id })
				.eq('user_chatroom_data.user_id', uid)
				.eq('user_chatroom_data.room_id', query.room_id)
				.single();
			if (user.error) {
				throw user.error;
			}

			const data: z.infer<typeof chatResourcesSchema>[] =
				(await requestHandler.platform.env.kv_cache.get(
					KV.CHAT_RESOURCES(query.room_id),
					'json'
				)) ?? [];
			const t = data.find((v) => v.id == query.id);
			const target = data.filter((v) => v.id !== query.id);
			if (user.data.user_chatroom_data[0]?.role == 'user') {
				if (t?.user_id !== uid) {
					throw new CustomError('You cannot delete others shared resource');
				}
			}
			await requestHandler.platform.env.kv_cache.put(
				KV.CHAT_RESOURCES(query.room_id),
				JSON.stringify(target)
			);
			return json(data);
		}
	)
	.get(
		'/resources/:room_id',
		zValidator('param', chatResourcesSchema.pick({ room_id: true })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('param');
			const data =
				(await requestHandler.platform.env.kv_cache.get(
					KV.CHAT_RESOURCES(query.room_id),
					'json'
				)) ?? [];

			return json(data as chatResource[]);
		}
	);

async function addInbox({
	requestHandler,
	room_id,
	event,
	user_id
}: {
	room_id: string;
	user_id: string;
	event: chatEvent['events'][number];
	requestHandler: apiEnv['Variables']['requestHandler'];
}) {
	const data: chatEvent = (await requestHandler.platform.env.kv_cache.get(
		KV.CHATROOM_USER_INBOX(user_id),
		'json'
	)) ?? { events: [], lastReadAt: 0 };
	event.id = nanoid(9);
	data.events.push(event);
	await requestHandler.platform.env.kv_cache.put(
		KV.CHATROOM_USER_INBOX(user_id),
		JSON.stringify({
			...data,
			events: lastN(data.events, CHATROOM.MAX_MESSAGE_IN_USER_INBOX)
		})
	);
}
const inbox = new Hono<apiEnv>()
	.post(
		'/add_events',
		zValidator('json', chatEvents),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const data: chatEvent = (await requestHandler.platform.env.kv_cache.get(
				KV.CHAT_RESOURCES(query.room_id),
				'json'
			)) ?? { events: [], lastReadAt: 0 };
			query.id = nanoid(9);
			data.events.push(query);
			await requestHandler.platform.env.kv_cache.put(
				KV.CHATROOM_USER_INBOX(uid),
				JSON.stringify({
					...data,
					events:
						data.events.length > CHATROOM.MAX_MESSAGE_IN_USER_INBOX
							? data.events.slice(1)
							: data.events
				})
			);
			return json(data as unknown as chatEvent);
		}
	)
	.get('/inbox', async ({ req, json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user_id;
		const data: chatEvent = (await requestHandler.platform.env.kv_cache.get(
			KV.CHATROOM_USER_INBOX(uid),
			'json'
		)) ?? { lastReadAt: 0, events: [] };
		return json(data as unknown as chatEvent);
	})
	.delete('/clear', async ({ req, json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user_id;
		await requestHandler.platform.env.kv_cache.delete(
			KV.CHATROOM_USER_INBOX(uid)
		);
		return json({ message: '' });
	});

const app = new Hono<apiEnv>()
	.get('/chatrooms', async ({ req, json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user_id;
		// const data = await supabaseServer()
		// 	.from('chatrooms')
		// 	.select('*,user_chatroom_data')
		// 	.filter()
		const data: chatrooms[] = await requestHandler.locals.sql()`
			select 
			chatrooms.mute_duration, chatrooms.mute_start_date,mute_all,
			owner_id, chatrooms.room_id, allow_join, is_deleted, chatrooms.name,chatrooms.created_at,chatrooms.description, max_user, secret,is_archived, is_public

			from chatrooms

			inner join  user_chatroom_data on chatrooms.room_id =user_chatroom_data.room_id and user_chatroom_data.user_id=${uid}

			where (chatrooms.owner_id =${uid} or (user_chatroom_data.user_id=${uid} and user_chatroom_data.is_joined = true and user_chatroom_data.is_banned is not true) ) and chatrooms.is_deleted is not true
			order by chatrooms.room_id
		`;
		data.sort((a, b) => (a.room_id < b.room_id ? 1 : -1));
		const owned = data.filter((v) => v.owner_id == uid);
		const joined = data
			.filter((v) => v.owner_id !== uid)
			.map((v) => {
				return { ...v, secret: null };
			});
		// const rooms: chatrooms[] =
		// 	(await requestHandler.platform.env.kv_cache.get(
		// 		KV.JOINED_ROOM(uid),
		// 		'json'
		// 	)) ?? [];
		// enrich
		return json({ own: owned, join: joined });
	})
	.get(
		'/:room_id/roommates',
		zValidator('param', z.object({ room_id: BigIntIdsZod })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('param');
			console.log('query', query);
			// roommate
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const users = await stub.getActiveUserArr();
			if (!users) {
				throw new CustomError('Room does not exists');
			}
			console.log('active users', users);
			await DisposeRPC(users);
			let exists = false;
			for (let x of users) {
				//x.status = 'offline';
				if (x.user_id == uid) {
					exists = true;
					//x.status = 'online';
				}
			}
			console.log('users', users);
			if (!exists) {
				throw new CustomError(
					'Cannot fetch roommates because you not a member'
				);
			}
			return json(sortBy(users, (v) => v.name));
		}
	)
	.post(
		'/create/chatroom',
		zValidator(
			'json',
			z.object({
				name: z
					.string()
					.min(
						CHATROOM.MIN_CHAT_ROOM_NAME,
						'Make sure room name length is > ' + CHATROOM.MIN_CHAT_ROOM_NAME
					)
					.max(CHATROOM.MAX_CHAT_ROOM_NAME),
				description: z.string().max(MAX_USER_CHAT_MESSAGE_LENGTH),
				secret: z.string(),
				allow_join: z.boolean(),
				is_public_room: z.boolean().default(false)
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//	let id = nanoid(); //=> "V1StGXR8_Z5jdHi6B-myT"
			const room_count = await supabase
				.from('chatrooms')
				.select('*', { count: 'exact' })
				.eq('owner_id', uid)
				.eq('is_archived', false)
				.eq('is_deleted', false);
			console.log('room count', room_count);
			if (room_count.error) {
				throw room_count.error;
			}
			if ((room_count.count ?? 0) >= MAX_USER_CHAT_ROOM) {
				throw new CustomError(
					`You can only create ${MAX_USER_CHAT_ROOM} room... will increase in the future`
				);
			}
			const r = await supabase
				.from('chatrooms')
				.insert({
					name: query.name,
					description: query.description,
					owner_id: uid,
					max_user: 10,
					roomer: [uid],
					room_id: uuidv7(),
					secret: query.secret,
					allow_join: query.allow_join,
					is_public: query.is_public_room ?? false
				})
				.select('*')
				.single();
			if (r.error) {
				throw r.error;
			}
			// set room admin
			const stub = await getChatStub({
				requestHandler,
				room_id: r.data.room_id
			});
			const i = await supabaseServer().from('user_chatroom_data').insert({
				room_id: r.data.room_id,
				name: 'Admin',
				description: 'Please fill in description',
				status: 'online',
				user_id: uid,
				is_joined: true,
				is_banned: false,
				is_kicked: false,
				is_muted: false,
				role: 'admin'
			});
			console.log('calling init room');
			const re = await stub.initRoom({
				admin: {
					user_id: uid,
					name: 'Admin',
					//mute_expiration: 0,
					status: 'offline' /* initially everyone is offline */,
					joined_at: new Date().toISOString(),
					is_banned: false,
					is_kicked: false,
					mute_start_date: null,
					mute_duration: 0,
					role: 'admin',
					description: '',
					is_joined: true,
					room_id: r.data.room_id,
					ban_why: '',
					created_at: r.data.created_at,
					is_muted: false
				},
				room_id: r.data.room_id,
				room: {
					room_id: r.data.room_id,
					is_archived: r.data.is_archived ?? false,
					allow_join: r.data.allow_join,
					is_deleted: r.data.is_deleted ?? false,
					is_public: r.data.is_public || false,
					max_user: r.data.max_user
				}
			});
			if (re?.error) {
				console.warn('Revert creating since do failed');
				const r =
					await requestHandler.locals.sql()`delete from chatroom where room_id=${r.data.room_id} cascade;`;
				console.log('reverted', r);
				throw new CustomError('Please try again , failed to create room');
			}
			await DisposeRPC(re);
			return json(r.data);
		}
	)
	.patch(
		'/chatroom',
		zValidator('json', chatroomSchema.partial()),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const r = await supabase
				.from('chatrooms')
				.update(removeNil(query))
				.eq('owner_id', uid)
				.eq('room_id', query!.room_id)
				.select('*')
				.single();
			if (r.error) {
				throw r.error;
			}
			//const stub = getChatStub({ requestHandler, room_id: r.data.room_id });
			return json(r.data);
		}
	)
	.patch(
		'/transfer/ownership',
		zValidator(
			'json',
			z.object({ new_owner: z.string(), room_id: z.string() })
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const r = await supabase
				.from('chatrooms')
				.select('room_id')
				.eq('owner_id', uid)
				.eq('room_id', query!.room_id)
				.single();
			if (r.error) {
				throw r.error;
			}
			if (r.data) {
				const transfer = await supabaseServer()
					.from('chatrooms')
					.update({ owner_id: query.new_owner })
					.eq('room_id', query.room_id);
				if (transfer.error) {
					throw transfer.error;
				}
				const stub = await getChatStub({
					requestHandler,
					room_id: r.data.room_id
				});
				const r1 = await stub.setAdmin({ user_id: query.new_owner });
				await DisposeRPC(r1);
				console.log('transfer room', transfer);
			}

			return json({ message: 'room transferred ' });
		}
	)
	.patch(
		'/update/admin',
		zValidator(
			'json',
			z.object({
				secret: z.string(),
				new_user_id: z.string()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const room_count = await supabase
				.from('profiles')
				.select('id')
				.eq('new_user_id', query.new_user_id)
				.single();
			if (room_count.error) {
				throw new CustomError(
					'You can only create one room... will increase in the future'
				);
			}
			const r = await supabase
				.from('chatrooms')
				.update({
					owner_id: query.new_user_id
				})
				.match({ secret: query.secret, owner_id: uid })
				.select('*')
				.single();
			if (r.error) {
				throw r.error;
			}
			const stub = await getChatStub({
				requestHandler,
				room_id: r.data.room_id
			});
			const a = await stub.setAdmin({ user_id: query.new_user_id });
			await DisposeRPC(a);
			return json(r.data);
		}
	)
	.patch(
		'/chatroom',
		zValidator('json', chatroomSchema.partial()),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			let id = nanoid(); //=> "V1StGXR8_Z5jdHi6B-myT"
			const r = await supabase
				.from('chatrooms')
				.update({
					name: query.name,
					description: query.description,
					owner_id: uid,
					max_user: query.max_user,
					reason: query.reason,
					roomer: [uid]
				})
				.eq('owner_id', uid)
				.eq('room_id', query!.room_id ?? '0')
				.select('*');

			return json(r.data);
		}
	)
	.post(
		'/join',
		zValidator(
			'json',
			z.object({
				secret: z.string(),
				room_id: z.string(),
				name: z.string().max(100).optional(),
				description: z.string().max(200).optional()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join
			const room = await supabaseServer()
				.from('chatrooms')
				.select('*,user_chatroom_data(is_banned)')
				.eq('room_id', query.room_id)
				.eq('user_chatroom_data.user_id', uid)
				.eq('user_chatroom_data.room_id', query.room_id)
				.single();
			console.log('room info', room);
			if (room.error) {
				throw room.error;
			}
			if (room.data?.secret !== query.secret && room.data.is_public === false) {
				throw new CustomError('Unauthorized; Bad Secret!');
			}
			if (room.data.owner_id === uid) {
				throw new CustomError('You cannot join your own room !');
			}
			if (room.data.user_chatroom_data[0]?.is_banned) {
				throw new CustomError('You were banned');
			}
			if (room.data.allow_join === false || room.data.is_archived) {
				throw new CustomError('Room locked');
			}
			let numUser = await supabaseServer()
				.from('user_chatroom_data')
				.select('*', { head: true, count: 'exact' })
				.eq('room_id', query.room_id)
				.eq('is_joined', true);
			if (numUser.error) {
				console.error('Failed to get room user stats', numUser);
				throw new CustomError(numUser.error.message);
			}
			if (numUser.count && room.data.max_user <= numUser.count) {
				throw new CustomError('Room is full...Sorry!');
			}
			// const joined_room = await supabase
			// 	.from('user_chatroom_data')
			// 	.select('*', { head: true, count: 'exact' })
			// 	.eq('user_id', uid)
			// 	.match({ is_joined: true });

			// update room info to allow this user in
			// const id = requestHandler.platform.env.chatroom.idFromName(
			// 	DO_GEN.ChatRoom({ room_id: query.room_id, secret: room.data?.secret })
			// );
			// let rooms: chatrooms[] =
			// 	(await requestHandler.platform.env.kv_cache.get(
			// 		KV.JOINED_ROOM(uid),
			// 		'json'
			// 	)) ?? [];

			// rooms.push(room.data);
			// rooms = uniqBy(rooms, (v) => v.room_id);
			// if (rooms.length >= MAX_TOTAL_CHAT_ROOM) {
			// 	console.log(rooms);
			// 	throw new CustomError(
			// 		'You can only join ' + MAX_TOTAL_CHAT_ROOM + ' Rooms'
			// 	);
			// }
			// update db
			const res = await supabaseServer()
				.from('user_chatroom_data')
				.update({
					is_joined: true
				})
				.eq('room_id', query.room_id)
				.match({ user_id: uid })
				.select('room_id')
				.single();
			console.log('updated', res);
			if (res.error) {
				const res = await supabaseServer()
					.from('user_chatroom_data')
					.insert({
						is_joined: true,
						room_id: query.room_id,
						user_id: uid,
						name: query.name ?? requestHandler.locals.profile.username,
						description: 'Misty...',
						left_at: null,
						status: 'offline'
					});
				console.log('inserted joined', res);
				if (res.error) {
					throw res.error;
				}
			} else {
				if (res.status == 204) {
					throw new CustomError('You already joined');
				}
			}
			// update kv cache
			// await requestHandler.platform.env.kv_cache.put(
			// 	KV.JOINED_ROOM(uid),
			// 	JSON.stringify(rooms)
			// );
			const data = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const d = await data.join({
				user_id: uid,
				name: requestHandler.locals.profile.username,
				status: 'offline',
				joined_at: new Date().toISOString(),
				is_banned: false,
				is_kicked: false,
				mute_start_date: null,
				mute_duration: 0,
				role: 'user',
				description:
					query.description ??
					'Add a description on who you are and why you want to join this room',
				ban_why: null,
				created_at: new Date().toISOString(),
				is_joined: true,
				is_muted: false,
				kick_reason: null,
				left_at: null,
				reason: null,
				room_id: ''
			});
			await DisposeRPC(d);
			if (d?.error) {
				throw new CustomError('(dobject error) ' + d.error);
			}
			return json({ message: 'Joined Room' });
		}
	)
	.post(
		'/archive',
		zValidator(
			'json',
			z.object({
				room_id: z.string()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join

			const res = await supabaseServer()
				.from('chatrooms')
				.update({ is_archived: true, allow_join: false })
				.eq('room_id', query.room_id)
				.eq('owner_id', uid);
			if (res.error) {
				// no content
				console.log(res);
				throw new CustomError('Failed to archive room ' + res.error.message);
			}
			const data = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const d = await data.archiveRoom({ initiator: uid });
			await DisposeRPC(d);
			if (d?.error) {
				throw new CustomError(d.error);
			}
			return json({ message: 'archived Room' });
		}
	)
	.post(
		'/ban',
		zValidator(
			'json',
			z.object({
				reason: z.string().max(100),
				room_id: BigIntIdsZod,
				user_id: BigIntIdsZod
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join
			// const room = await supabase
			// 	.from('chatrooms')
			// 	.select('*')
			// 	.eq('room_id', query.room_id)
			// 	.single();
			// if (room.data?.secret !== query.secret) {
			// 	throw new CustomError('Unauthorized!');
			// }
			// update room info to allow this user in

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const ban = await stub.ban({
				user_id: query.user_id,
				initiator_id: uid,
				reason: query.reason
			});
			await DisposeRPC(ban);
			if (ban?.error) {
				throw new CustomError('Error: ' + ban.error);
			}
			// update db
			const up = await supabase
				.from('user_chatroom_data')
				.update({ is_banned: true, is_joined: false, ban_why: query.reason })
				.eq('user_id', query.user_id)
				.match({ room_id: query.room_id });

			// await removeRoomKV({
			// 	requestHandler,
			// 	uid: query.user_id,
			// 	room: query.room_id
			// });
			// remove from user cache
			if (up.error) {
				throw new CustomError(up.error.message);
			}
			const room_name = await supabaseServer()
				.from('chatrooms')
				.select('name')
				.eq('room_id', query.room_id)
				.single();
			if (room_name.error) {
				console.log('failed to get room name');
			}
			let a = ` <div style="text-align: center; padding: 10px; border: 1px solid #ccc; color: #555; font-family: Arial;">
			<h3 style="color: #d9534f;">Notice</h3>
			<p>You have been kicked from ${room_name.data?.name}.</p>
				<p style="font-size: 12px; color: #888;">${IsomorphicSanitizer(query.reason)}</p>
			</div>`;
			let c = `<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 400px;">
  <h2 style="color: #d9534f;">You've been removed from <span style="font-weight: normal;">${room_name.data?.name}</span></h2>
  <p>Reason: <strong>${IsomorphicSanitizer(query.reason) ?? 'No Reason Provided'}</strong></p>
</div>`;
			await addInbox({
				requestHandler,
				user_id: query.user_id,
				room_id: query.room_id,
				event: {
					description: a,
					room_id: query.room_id,
					user_id: query.user_id,
					created_at: Date.now(),
					event_type: 'ban'
				}
			});
			return json({ message: 'removed Room' });
		}
	)
	.post(
		'/unban',
		zValidator(
			'json',
			z.object({
				room_id: BigIntIdsZod,
				user_id: BigIntIdsZod
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join
			// const room = await supabase
			// 	.from('chatrooms')
			// 	.select('*')
			// 	.eq('room_id', query.room_id)
			// 	.single();
			// if (room.data?.secret !== query.secret) {
			// 	throw new CustomError('Unauthorized!');
			// }
			// update room info to allow this user in

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const ban = await stub.createUser({
				user_id: query.user_id,
				is_banned: false,
				reason: '',
				ban_why: null,
				created_at: null,
				description: '',
				is_joined: false,
				is_kicked: null,
				is_muted: null,
				joined_at: null,
				kick_reason: null,
				left_at: null,
				mute_duration: null,
				mute_start_date: null,
				name: query.user_id,
				role: 'user',
				room_id: '',
				status: 'offline'
			});
			// update db
			const up = await supabase
				.from('user_chatroom_data')
				.update({ is_banned: false, ban_why: '', is_joined: false })
				.eq('user_id', query.user_id)
				.match({ room_id: query.room_id });
			// await removeRoomKV({
			// 	requestHandler,
			// 	uid: query.user_id,
			// 	room: query.room_id
			// });
			await DisposeRPC(ban);
			// remove from user cache
			if (up.error) {
				throw new CustomError(up.error.message);
			}
			return json({ message: 'removed Room' });
		}
	)
	.post(
		'/quit',
		zValidator(
			'json',
			z.object({
				room_id: z.string().max(500)
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const ban = await stub.quit({
				user_id: uid
			});
			await DisposeRPC(ban);
			// update db
			const up = await supabase
				.from('user_chatroom_data')
				.update({ left_at: new Date().toISOString(), is_joined: false })
				.eq('user_id', uid)
				.match({ room_id: query.room_id });
			// remove from user cache
			if (up.error) {
				throw new CustomError(up.error.message);
			}
			// await removeRoomKV({
			// 	requestHandler,
			// 	uid: uid,
			// 	room: query.room_id
			// });
			return json({ message: 'removed Room' });
		}
	)
	.post(
		'/kick',
		zValidator(
			'json',
			z.object({
				room_id: BigIntIdsZod,
				user_id: BigIntIdsZod,
				reason: z.string().max(200)
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});

			// create notification ?

			const ban = await stub.kick({
				user_id: query.user_id,
				initiator_id: uid,
				reason: query.reason,
				type: 'kick'
			});
			await DisposeRPC(ban);
			if (ban?.error) {
				throw new CustomError(ban.error);
			}
			// update db
			const up = await supabase
				.from('user_chatroom_data')
				.update({ left_at: new Date().toISOString(), is_joined: false })
				.eq('user_id', query.user_id)
				.match({ room_id: query.room_id });
			const room_name = await supabase
				.from('chatrooms')
				.select('name')
				.eq('room_id', query.room_id)
				.single();
			// remove from user cache
			if (up.error) {
				throw new CustomError(up.error.message);
			}
			let a = ` <div style="text-align: center; padding: 10px; border: 1px solid #ccc; color: #555; font-family: Arial;">
    				<h3 style="color: #d9534f;">Notice</h3>
   				 <p>You have been kicked from ${room_name.data?.name}.</p>
    		<p style="font-size: 12px; color: #888;">${IsomorphicSanitizer(query.reason)}</p>
 		 </div>`;
			let r = `<div style="font-family: Arial, sans-serif; color: #333; padding: 15px; border: 1px solid #e74c3c; border-radius: 5px; max-width: 300px; text-align: center;">
			<h3 style="color: #e74c3c;">Removed from ${room_name.data?.name}</h3>
			<p>Reason: <strong>${IsomorphicSanitizer(query.reason)}</strong></p>
			</div>`;
			await addInbox({
				requestHandler,
				user_id: query.user_id,
				room_id: query.room_id,
				event: {
					description: a,
					room_id: query.room_id,
					user_id: query.user_id,
					created_at: Date.now(),
					event_type: 'kick'
				}
			});
			// await removeRoomKV({
			// 	requestHandler,
			// 	uid: uid,
			// 	room: query.room_id
			// });
			return json({ message: 'kicked from  Room' });
		}
	)
	.post(
		'/mod',
		zValidator(
			'json',
			z.object({
				room_id: BigIntIdsZod,
				user_id: BigIntIdsZod,
				mod: z.boolean()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			// create notification ?

			const ban = await stub.setRole({
				user_id: query.user_id,
				initiator_id: uid,
				role: query.mod ? 'moderator' : 'user'
			});
			await DisposeRPC(ban);
			if (ban?.error) {
				throw new CustomError(ban.error);
			}
			// update db
			const up = await supabase
				.from('user_chatroom_data')
				.update({
					left_at: new Date().toISOString(),
					role: query.mod ? 'moderator' : 'user'
				})
				.eq('user_id', uid)
				.match({ room_id: query.room_id });
			// remove from user cache
			if (up.error) {
				throw new CustomError(up.error.message);
			}

			return json({ message: 'assigned mod' });
		}
	)
	.post(
		'/mute',
		zValidator(
			'json',
			z.object({
				user_id: BigIntIdsZod,
				room_id: BigIntIdsZod,
				start_date: z.number().optional(),
				mute_duration: z.number(),
				reason: z.string().max(100).optional()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join
			// const room = await supabase
			// 	.from('chatrooms')
			// 	.select('*')
			// 	.eq('room_id', query.room_id)
			// 	.single();
			// update room info to allow this user in
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const res = await stub.mute({
				mute_all: false,
				user_id: query.user_id,
				duration: query.mute_duration,
				initiator_id: uid,
				start_date: Date.now(),
				reason: query.reason,
				type: 'mute'
			});
			await DisposeRPC(res);
			if (res.error) {
				throw new CustomError(res.error);
			}
			const data = await supabaseServer()
				.from('user_chatroom_data')
				.update({
					mute_start_date: query.start_date
						? new Date(query.start_date).toISOString()
						: new Date().toISOString(),
					mute_duration: query.mute_duration
				})
				.eq('user_id', query.user_id)
				.match({ room_id: query.room_id });

			if (data.error) throw data.error;
			return json({ message: data });
		}
	)
	.post(
		'/unmute',
		zValidator(
			'json',
			z.object({
				user_id: BigIntIdsZod,
				room_id: BigIntIdsZod,
				mute: z.boolean().default(false),
				reason: z.string().max(100).optional()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			//check if such room exists and if user is allowed to join
			// const room = await supabase
			// 	.from('chatrooms')
			// 	.select('*')
			// 	.eq('room_id', query.room_id)
			// 	.single();
			// update room info to allow this user in
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const res = await stub.unmute({
				mute_all: false,
				user_id: query.user_id,
				initiator_id: uid,
				reason: query.reason ?? 'no reason',
				type: 'mute'
			});
			await DisposeRPC(res);
			if (res.error) {
				throw new CustomError(res.error);
			}
			const data = await supabaseServer()
				.from('user_chatroom_data')
				.update({
					mute_start_date: new Date('1990/1/1').toISOString(),
					is_muted: false,
					mute_duration: 0
				})
				.eq('user_id', query.user_id)
				.match({ room_id: query.room_id });

			if (data.error) throw data.error;
			return json({ message: data });
		}
	)
	.post(
		'/mute_room',
		zValidator(
			'json',
			z.object({
				room_id: z.string().uuid(),
				mute_start_date: z.number().optional(),
				mute: z.boolean(),
				mute_duration: z.number().max(CHATROOM.MAX_MUTE_TIME).min(0),
				reason: z.string().max(CHATROOM.MAX_REASON).optional()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');

			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const ban = query.mute
				? await stub.mute({
						duration: query.mute_duration,
						mute_all: true,
						user_id: '',
						type: 'mute',
						start_date: query.mute_start_date ?? Date.now(),
						initiator_id: uid,
						reason: query.reason ?? 'No Reason'
					})
				: await stub.unmute({
						mute_all: true,
						user_id: '',
						type: 'mute',
						initiator_id: uid,
						reason: query.reason ?? 'No Reason'
					});
			console.log(ban);
			await DisposeRPC(ban);
			if (ban.error) {
				throw new CustomError(ban.error);
			}
			const room = await supabase
				.from('chatrooms')
				.update({
					mute_all: true,
					mute_duration: query.mute_duration,
					mute_start_date: query.mute_start_date
						? new Date(query.mute_start_date).toISOString()
						: new Date().toISOString()
				})
				.eq('room_id', query.room_id)
				.eq('owner_id', uid)
				.single();
			if (room.error) throw new Error('Unauthorized');
			// update room info to allow this user in
			return json({ message: 'muted Room' });
		}
	)

	.get(
		'/muted/user',
		zValidator(
			'json',
			z.object({
				room_id: z.string().uuid(),
				mute_start_date: z.number(),
				mute_duration: z.number(),
				reason: z.string().max(CHATROOM.MAX_REASON).optional()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const users = await stub.getMutedUsers();
			console.log(users);
			await DisposeRPC(users);
			return json({ message: 'muted users room' });
		}
	)
	.delete(
		'/chatroom',
		zValidator(
			'json',
			z.object({
				room_id: z.string().uuid()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const room = await supabase
				.from('chatrooms')
				.update({
					allow_join: false,
					is_archived: true,
					is_deleted: true
				})
				.eq('room_id', query.room_id)
				.eq('owner_id', uid);
			if (room.error) {
				throw room.error;
			}
			// update room info to allow this user in
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			await requestHandler.platform.env.kv_cache.delete(
				KV.CHAT_RESOURCES(query.room_id)
			);
			//await removeRoomKV({ requestHandler, uid, room: query.room_id });
			const ban = await stub.clear();
			await DisposeRPC(ban);
			return json({ message: 'hide Room' });
		}
	)
	.get(
		'/user/events',
		zValidator('query', z.object({ room_id: z.string() })),
		async ({ req, json, var: { requestHandler } }) => {
			//TODO u can only get user event if you are room member

			const query = req.valid('query');
			const uid = requestHandler.locals.user_id;
			/* const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const room = stub.getUserFromDB(); */
			const uevent =
				(await requestHandler.platform.env.kv_cache.get(
					KV.USER_EVENTS(uid),
					'json'
				)) ?? [];

			return json(uevent as UserEvent[]);
		}
	)
	.get(
		'/announce',
		zValidator(
			'query',
			z.object({
				room_id: z.string().uuid()
			})
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			// check if user is room member
			const user_rooms = (await requestHandler.platform.env.kv_cache.get(
				KV.JOINED_ROOM(uid),
				'json'
			)) as chatrooms[];
			if (!user_rooms || user_rooms.find((v) => v.room_id !== query.room_id)) {
				throw new CustomError('Unauthorized');
			}

			const announcement: IncomingMessages['announce'] =
				await requestHandler.platform.env.kv_cache.get(
					KV.CHATROOM_NOTIFICATION(query.room_id),
					'json'
				);
			return json(announcement ?? null);
		}
	)
	.post(
		'/announce',
		zValidator('json', announcementSchema),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			// check if user is room member
			const user_rooms = (await requestHandler.platform.env.kv_cache.get(
				KV.JOINED_ROOM(uid),
				'json'
			)) as chatrooms[];
			console.log('joined rooms', user_rooms);
			if (!user_rooms || user_rooms.find((v) => v.room_id !== query.room_id)) {
				throw new CustomError('Unauthorized');
			}
			await requestHandler.platform.env.kv_cache.put(
				KV.CHATROOM_NOTIFICATION(query.room_id),
				JSON.stringify({
					//room_id: query.room_id,
					body: query.body,
					title: query.title,
					created_at: Date.now(),
					end: query.end,
					start: query.start
				} as IncomingMessages['announce'])
			);
			// broadcast announcement
			return json({ message: 'created ' });
		}
	)
	.post(
		'/update/user',
		zValidator('json', chatUserSchema.partial()),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			let data = {
				name: query.name,
				description: query.description,
				status: query.status
			};
			removeNil(data);
			const r = await supabaseServer()
				.from('user_chatroom_data')
				.update(data)
				.eq('user_id', uid)
				.match({ room_id: query.room_id });
			console.log('update', uid, r);
			if (r.error) {
				throw r.error;
			}
			// set room admin
			const stub = await getChatStub({
				requestHandler,
				room_id: query.room_id
			});
			const payload = {
				user_id: uid,
				...data
			};
			removeNil(payload);
			const re = await stub.updateUser(data);
			await DisposeRPC(re);
			return json({ message: query });
		}
	)
	.post(
		'/banned/users',
		zValidator(
			'json',
			genZodSchemaObject(
				z.object({
					room_id: z.string()
				})
			)
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const is_owner = await supabaseServer()
				.from('chatrooms')
				.select('*')
				.eq('owner_id', uid)
				.match({ room_id: query.filter.room_id })
				.single();
			if (is_owner.error) {
				throw new CustomError(is_owner.error.message);
			}
			const r = await supabase
				.from('user_chatroom_data')
				.select('*')
				.eq('is_banned', true)
				.eq('room_id', query.filter.room_id)
				.range(query.paginate.start, query.paginate.end - 1)
				.order('user_id');
			if (r.error) {
				throw r.error;
			}
			return json(r.data);
		}
	)
	.post(
		'/list/public/rooms',
		zValidator('json', genZodSchemaObject(chatroomSchema.partial())),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			console.log(await req.json());
			const query = req.valid('json');
			// cursor
			let builder = await requestHandler.locals.sql()`
				select count(ucd.user_id) as user_count, chatrooms.room_id, chatrooms.max_user, chatrooms.name, chatrooms.description, owner_id, (profiles.username) as owner_name

				from chatrooms 

				inner join user_chatroom_data ucd on ucd.room_id = chatrooms.room_id and ucd.is_joined=true

				inner join profiles on chatrooms.owner_id = profiles.id
			
				where chatrooms.is_public = true  ${query.paginate.last_cursor ? requestHandler.locals.sql()` and chatrooms.room_id >= ${query.paginate.last_cursor}` : requestHandler.locals.sql()``}
				 -- full text 
				${query.search?.regex ? requestHandler.locals.sql()` and chatrooms.name &@ ${query.search?.regex}` : requestHandler.locals.sql()``}

				group by chatrooms.room_id, profiles.username

				order by room_id

				limit ${Math.min(query.paginate.size ?? 50, 50)}
				
			`;

			return json(
				builder as unknown as {
					user_count: number;
					room_id: string;
					max_user: string;
					name: string;
					description: string;
					owner_id: string;
					owner_name: string;
				}[]
			);
		}
	)
	.route('/', resource)
	.route('/', inbox);

export const chatApp = new Hono()
	.route('/protected', app)
	.onError((err, { json }) => {
		console.error('error in room ', err);
		if (err instanceof Error) {
			console.log(err);
			return json({ message: err.message }, 400);
		}
		return json(err, 500);
	});
