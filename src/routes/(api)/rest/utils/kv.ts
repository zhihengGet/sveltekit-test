import type { ID } from '$lib/types';

export const KV = {
	USER_SETTING: (user_id: string, book_id?: ID) =>
		'USER_SETTING_' + user_id + ':' + book_id,
	AUTHOR_SETTING: (user_id: string, book_id?: ID) =>
		'USER_SETTING_' + user_id + ':' + book_id,
	BOOK_THEME: (user_id: string, book_id?: ID) =>
		'BOOK_THEME_' + user_id + ':' + book_id,
	AUTHOR_SETTING_BOOK_LEVEL: (book_id: ID) => 'AUTHOR_BOOK_SETTING:' + book_id,
	DB_API_CONFIG: () =>
		//USED TO CONTROL SOME API , stats counter
		'DB_API_CONFIG',
	BOOK_SOCIAL: (book_id: ID) => 'AUTHOR_BOOK_SETTING:' + book_id,
	USER_SHELF: (user_id: string) => 'USER_SHELF:' + user_id,
	USER_MESSAGE_READ_DATA: (user_id: string) =>
		'USER_MESSAGE_READ_DATA:' + user_id,
	AUTHOR_FOLLOWER_MESSAGE: (user_id: string) =>
		'AUTHOR_FOLLOWER_MESSAGE:' + user_id,
	AUTHOR_BOOK_NOTIFICATION: (user_id: string) =>
		'AUTHOR_BOOK_NOTIFICATION:' + user_id,
	BOOK_PERMISSION_GRID: (args: { book_id: string }) =>
		'BOOK_PERMISSION:' + args.book_id,
	USER_EVENTS: (uid: string) => 'user_events_' + uid,
	SITEWIDE_MESSAGE: () => 'SITEWIDE_MESSAGE',
	// CHAT ROOM
	// global chat events, kicked,banned
	CHATROOM_NOTIFICATION: (ROOM_ID: string) =>
		'Chatroom-Notification-' + ROOM_ID,
	CHATROOM_USER_INBOX: (user: string) => 'Chatroom-Notification-' + user,
	// SPECIFIC_CHATROOM_USER_INBOX: (ROOM_ID: string, USER_ID: string) =>
	// 	'Room-Inbox-' + ROOM_ID + '-' + USER_ID,
	CHAT_RESOURCES: (ROOM_ID: string) => 'Room-Resources-' + ROOM_ID
};
export const DO_GEN = {
	EVENT_REVIEW_THROTTLER_NAME: (book_id: number) =>
		'EVENT-NOTIFIER-REVIEW-' + book_id,
	EVENT_COMMENT_THROTTLER_NAME: (
		chapter_id: number //TODO chapte rlevel or book level or section level ?
	) => 'EVENT-NOTIFIER-COMMENT-' + chapter_id,
	UPDATE_USER_STATS: (
		// used in profile page to update user stas
		user_id: string
	) => 'USER_STATS_' + user_id,
	UPDATE_BOOK_STATS: (
		// REVIEW COUNT, AVERAGE RATING, CHAPTER LIKE/DISLIKE SUM
		user_id: string
	) => 'USER_STATS_' + user_id,
	UPDATE_LIKE_DISLIKE_FROM_DB: (arg: { table: string; id: string | number }) =>
		'STATS-COUNTER-' + arg.table + ':' + arg.id,
	HTTP_SCHEDULE_TASK: (args: {
		unique_id: string;
		type: 'chapter_scheduled_publish' | 'book_stats_update';
	}) => {
		return `HTTP-ALARM-SCHEDULE-${args.type}-${args.unique_id}`;
	},
	ChatRoom: (args: { room_id: string; secret?: string }) => {
		return `ChatRoom-${args.room_id}`;
	},
	BOOK_HTTP_SCHEDULE_TASK: (args: {
		unique_id: string;
		type: 'book_stats_update';
	}) => {
		return `HTTP-ALARM-SCHEDULE-${args.type}-${args.unique_id}`;
	}
};

export type KV_API_CONFIG = {
	should_fetch_like_stats_from_db: boolean;
	should_update_book_stats: boolean;
	should_update_user_stats: boolean;
} | null;
