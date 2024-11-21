import z, { bigint } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
import { CHATROOM } from '$lib/data/constants';
export const announcementSchema = z.object({
	room_id: z.string().uuid('room id is required'),
	body: z
		.string()
		.min(5, 'body should be at lease 5 characters')
		.max(500, 'body has a limit of 500 characters'),
	title: z.string().max(100, 'body has a limit of 100 characters'),
	start: z.number().optional(),
	end: z.number().optional(),
	hour: z.number().nullish() /* not required */
});
export const announcementInputSchema = announcementSchema.pick({
	body: true,
	title: true,
	hour: true
});
export const chatUserStatus = [
	'typing',
	'online',
	'offline',
	'vacation',
	'resting',
	'away',
	'banned',
	'kicked'
] as const;
export const chat_roles = ['user', 'admin', 'moderator'];
export type chat_roles = 'user' | 'admin' | 'moderator';
export const chatUserSchema = z.object({
	is_banned: z.boolean(),
	room_id: BigIntIdsZod,
	user_id: BigIntIdsZod,
	is_kicked: z.boolean(),
	reason: z.string().max(CHATROOM.MAX_REASON),
	name: z
		.string()
		.min(
			CHATROOM.MIN_CHAT_ROOM_NAME,
			'Make sure room name length is > ' + CHATROOM.MIN_CHAT_ROOM_NAME
		)
		.max(CHATROOM.MAX_CHAT_ROOM_NAME),
	joined_at: z.string(),
	left_at: z.string(),
	role: z.enum(['user', 'admin', 'moderator']),
	status: z.enum(chatUserStatus),
	is_muted: z.boolean(),
	mute_start_date: z.string(),
	mute_duration: z.number(),
	description: z.string().max(CHATROOM.MAX_USER_DESCRIPTION)
});
export const chatroomSchema = z.object({
	name: z.string().max(32).min(1),
	description: z.string().min(10).max(500),
	reason: z.string(),
	room_id: BigIntIdsZod,
	secret: z.string(),
	max_user: z.number().max(CHATROOM.MAX_NUMBER_OF_USER_IN_ROOM),
	//roomer: z.string().optional(),
	status: z.enum(['archived', 'live']),
	is_archived: z.boolean(),
	allow_join: z.boolean().optional(),
	mute_all: z.boolean(),
	mute_start_date: z.string(),
	mute_duration: z.number(),
	is_public: z.boolean().default(false)
});
export const chatResourcesSchema = z.object({
	id: z.string().optional(),
	user_id: BigIntIdsZod,
	link: z.string().url().optional(),
	room_id: BigIntIdsZod,
	title: z
		.string()
		.min(
			CHATROOM.MIN_CHAT_ROOM_NAME,
			'Make sure title name length is > ' + CHATROOM.MIN_CHAT_ROOM_NAME
		)
		.max(CHATROOM.MAX_CHAT_ROOM_NAME),
	description: z.string().max(CHATROOM.MAX_USER_DESCRIPTION)
});
export const chatEvents = z.object({
	id: z.string().optional(),
	event_type: z.enum(['kick', 'ban', 'ownership']),
	user_id: BigIntIdsZod,
	room_id: BigIntIdsZod,
	created_at: z.number(),
	description: z.string().max(CHATROOM.MAX_USER_DESCRIPTION)
});
export type chatResource = z.infer<typeof chatResourcesSchema>;
export type chatEvent = {
	lastReadAt: number;
	events: z.infer<typeof chatEvents>[];
};
