import { boolean, z } from 'zod';
import {
	MAX_AUTHOR_BOOK_MESSAGE_SIZE,
	MAX_MESSAGE_BODY_LENGTH
} from '$lib/data/constants';
import { BigIntIdsZod } from './querySchema/zodPagination';
export type message_types = 'site' | 'follower' | 'book';
export const message_types = {
	SITE: 'site',
	FOLLOWER: 'follower',
	BOOK: 'book'
} as const;
const messageType = z.enum(Object.values(message_types) as [message_types]);
//message
export const followerMessage = z.object({
	author_name: z.string().optional(),
	author_id: z.string().optional(),
	type: z.string().default('follower'),
	//message: z.string().max(MAX_AUTHOR_MESSAGE),
	messages: z
		.array(
			z.object({
				created_at: z.number(),
				message: z.string().max(MAX_MESSAGE_BODY_LENGTH),
				header: z.string().optional(),
				author_name: z.string().optional(), //duplicated
				author_id: z.string().optional(),
				is_read: z.boolean().optional(), //was this message consumed already. This is for client side typing only)
				type: messageType.optional(),
				scheduleTime: z.number().optional(), // when to show
				importance: z
					.object({
						level: z.string(),
						score: z.number(),
						description: z.string(),
						color: z.string()
					})
					.partial(),
				expirationDate: z.number().nullish(),
				id: z.string().optional() // type of id used to read/unread ? or we can just use created_at
			})
		)
		.max(101)
});
export const siteMessage = z.object({
	created_at: z.number(),
	message: z.string(),
	header: z.string(),
	is_read: z.boolean().optional(), //was this message by user
	importance: z
		.object({
			level: z.string(),
			score: z.number(),
			description: z.string(),
			color: z.string()
		})
		.partial(),
	expirationDate: z.number().nullable(),
	id: z.string().optional() // type of id used to read/unread ? or we can just use created_at
});
export type followerMessages = z.infer<typeof followerMessage>;
export type siteMessage = z.infer<typeof siteMessage>;
export const bookMessageSchema = siteMessage.merge(
	z.object({ book_id: BigIntIdsZod })
);
export type bookMessage = siteMessage;

export const defaultUserReadData: user_has_read = {
	follower: { last_open_date: 0 },
	site: { last_open_date: 0 },
	book: { last_open_date: 0 }
};
type user_has_read = {
	[s in message_types]: {
		type?: message_types; // type of message
		is_read?: boolean;
		last_open_date: number;
	};
};
const user_message_data = z.record(
	z.string(), //ideally messageType
	z.union([
		z.object({
			type: messageType.nullish(),
			is_read: z.boolean().nullish(),
			id: z.string().optional().nullish(),
			last_open_date: z.number()
		}),
		z.object({
			last_open_date: z.number()
		})
	])
);
export type { user_has_read };
export { user_message_data };
