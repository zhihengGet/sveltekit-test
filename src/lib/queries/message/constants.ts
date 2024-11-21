export type message_types = 'site' | 'follower' | 'book';
export const message_types = {
	SITE: 'site',
	FOLLOWER: 'follower',
	BOOK: 'book'
} as const;
