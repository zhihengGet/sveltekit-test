import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { zValidator } from '@hono/zod-validator';
import { boolean, z } from 'zod';
import {
	MAX_AUTHOR_BOOK_MESSAGE_SIZE,
	MAX_MESSAGE_BODY_LENGTH,
	MAX_NUMBER_OF_FOLLOWER_MESSAGE,
	MAX_NUMBER_OF_FOLLOWER_MESSAGE_PER_DAY
} from '$lib/data/constants';
import { supabase } from '$lib/supabaseClient/client';
import { KV } from './utils/kv';
import { CustomError } from '$lib/queries/base/errors';
import {
	bookMessageSchema,
	defaultUserReadData,
	followerMessage,
	message_types,
	user_message_data,
	type bookMessage,
	type followerMessages,
	type user_has_read
} from '$lib/schema/messageSchemas';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { zodClean } from './utils/zodClean';
import { differenceInDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { dev } from '$app/environment';
const messageType = z.enum(Object.values(message_types) as [message_types]);
function sameDay(d1: Date, d2: Date) {
	//same or greater than
	return (
		d1.getFullYear() == d2.getFullYear() &&
		d1.getMonth() == d2.getMonth() &&
		d1.getDate() == d2.getDate()
	);
}
const messageApp = new Hono<apiEnv>()
	.post(
		'/create/follower/message',
		zValidator('json', followerMessage),
		async ({ req, json, var: v }) => {
			const query = await req.valid('json');
			// save to db
			const uid = v.requestHandler.locals.user.id;
			//	const id = uuidv7();
			query.author_name = v.requestHandler.locals.profile.username;
			query.author_id = uid;
			query.type = 'follower';
			let date = 0;
			for (let x of query.messages) {
				//TODO implement scheduled messages
				if (differenceInDays(new Date(), x.created_at) == 0) {
					//how many message were created today
					date += 1;
				}
				x.author_name = v.requestHandler.locals.profile.username;
				x.author_id = uid;
			}
			await v.requestHandler.platform.env.kv_cache.put(
				KV.AUTHOR_FOLLOWER_MESSAGE(uid),
				JSON.stringify(query)
			);
			return json({ message: `created new message ${date}` });
			// save to db as multiple row or one table
			// one able is better
			//await supabase.from('author_follower_message');
		}
	)
	.get(
		'/follower/messages',
		//	zValidator('json', messageSchema),
		async ({ json, req, var: v }) => {
			const uid = v.requestHandler.locals.user_id;
			const follower = await supabaseServer()
				.from('user_profile_data')
				.select('target')
				.match({ self: uid, is_follower: true });

			let user_read = (await v.requestHandler.platform.env.kv_cache.get(
				KV.USER_MESSAGE_READ_DATA(uid),
				'json'
			)) as user_has_read;

			if (follower.error) {
				throw follower.error;
			}
			console.log('getting all follower messages', follower.data);
			let messageObj: { [s in string]: followerMessages } = {};
			for (let follow of follower.data) {
				// fetch top  message
				//get from cache
				const messages = ((await v.requestHandler.platform.env.kv_cache.get(
					KV.AUTHOR_FOLLOWER_MESSAGE(follow.target),
					'json'
				)) as followerMessages) ?? { type: 'follower', messages: [] };
				messages.type = 'follower';
				let cleaned: followerMessages['messages'] = [];
				// allow author to see all messaged including expired
				for (let x of messages.messages) {
					const isNotExpired =
						!x.expirationDate ||
						!isBefore(x.expirationDate, new Date()) ||
						x.author_id == uid;
					const isNotScheduled =
						x.scheduleTime &&
						!isBefore(x.scheduleTime, new Date()) &&
						x.author_id !== uid; // author can get all messages
					// check if message expired
					// expired message will be automatically deleted
					if (!isNotScheduled && isNotExpired) {
						x.is_read = true;
						x.type = 'follower';
						if (
							x.created_at > user_read[x.type]?.last_open_date ||
							!user_read[x.type]
						) {
							x.is_read = false;
						}
						cleaned.push(x);
					} //message expired
				}
				messages.messages = cleaned;
				messageObj[follow.target] = messages;
			}
			/* const messages = await v.requestHandler.platform.env.kv_cache.get(
				KV.SITE-WIDE_MESSAGE(),
				'json'
			); */
			return json(messageObj);
		}
	)
	.get(
		'/all/messages',
		//	zValidator('json', messageSchema),
		async ({ json, req, var: v }) => {
			const uid = v.requestHandler.locals.user_id;
			const follower = await supabaseServer()
				.from('user_profile_data')
				.select('target')
				.match({ self: uid, is_follower: true });

			if (follower.error) {
				throw follower.error;
			}
			console.log('getting all follower messages', follower.data);
			let messageObj: { [s in string]: followerMessages } = {};
			for (let follow of follower.data) {
				// fetch top  message
				//get from cache
				const messages = (await v.requestHandler.platform.env.kv_cache.get(
					KV.AUTHOR_FOLLOWER_MESSAGE(follow.target),
					'json'
				)) as followerMessages;

				messageObj[follow.target] = messages;
			}
			const messages = await v.requestHandler.platform.env.kv_cache.get(
				KV.SITEWIDE_MESSAGE(),
				'json'
			);

			return json({
				follower: Object.values(messageObj).flat(),
				site: messages
			});
		}
	)
	.get(
		'/site/messages',
		//	zValidator('json', messageSchema),
		async ({ json, req, var: v }) => {
			if (!dev) {
				console.log('site message declined');
				return;
			}
			const uid = v.requestHandler.locals.user_id;
			let user_read = (await v.requestHandler.platform.env.kv_cache.get(
				KV.USER_MESSAGE_READ_DATA(uid),
				'json'
			)) as user_has_read;
			const messages = (await v.requestHandler.platform.env.kv_cache.get(
				KV.SITEWIDE_MESSAGE(),
				'json'
			)) as followerMessages;
			for (let x of messages?.messages ?? []) {
				x.is_read = true;
				if (x.created_at > user_read['site'].last_open_date) {
					x.is_read = false;
				}
			}
			return json(messages?.messages ?? []);
		}
	)
	/* .get(
		'/site/messages',
		//	zValidator('json', messageSchema),
		async ({ json, req, var: v }) => {
			const messages = (await v.requestHandler.platform.env.kv_cache.get(
				KV.AUTHOR_FOLLOWER_MESSAGE(follow.target),
				'json'
			)) as props;
			return json(messageObj);
		}
	) */
	.get(
		'/follower/message',
		zValidator('query', z.object({ id: z.string() })),
		async ({ json, req, var: v }) => {
			const uid = v.requestHandler.locals.user_id;
			const query = req.valid('query');
			const messages = (await v.requestHandler.platform.env.kv_cache.get(
				KV.AUTHOR_FOLLOWER_MESSAGE(query.id),
				'json'
			)) as z.infer<typeof followerMessage>;
			return json(messages ?? { messages: [], type: 'follower' });
		}
	)
	.post(
		'/author/message',
		zValidator('json', bookMessageSchema),
		async ({ req, var: v }) => {
			const query = await req.valid('json');
			console.log('query', query);
			// save to db
			const uid = v.requestHandler.locals.user.id;
			const is_owner = await supabase
				.from('books')
				.select('*', { head: true })
				.match({ id: query.book_id, author_id: uid })
				.single();
			if (is_owner.error) throw new CustomError('Unauthorized');
			query.created_at = Date.now();
			await v.requestHandler.platform.env.kv_cache.put(
				KV.AUTHOR_BOOK_NOTIFICATION(query.book_id),
				JSON.stringify(query)
			);
			return new Response(JSON.stringify(query));
		}
	)
	.get(
		'/author/message',
		zValidator('query', z.object({ book_id: z.string() })),
		async ({ json, req, var: v }) => {
			const query = await req.valid('query');
			const messages = (await v.requestHandler.platform.env.kv_cache.get(
				KV.AUTHOR_BOOK_NOTIFICATION(query.book_id),
				'json'
			)) as bookMessage | null;
			return json(messages);
		}
	)
	.delete(
		'/author/message',
		zValidator('query', z.object({ book_id: z.string() })),
		async ({ json, req, var: v }) => {
			const uid = v.requestHandler.locals.user.id;
			const query = await req.valid('query');
			const is_owner = await supabase
				.from('books')
				.select('*', { head: true })
				.match({ id: query.book_id, author_id: uid })
				.single();
			if (is_owner.error) throw new CustomError('Unauthorized');
			const messages = await v.requestHandler.platform.env.kv_cache.delete(
				KV.AUTHOR_BOOK_NOTIFICATION(query.book_id)
			);
			return json({ message: 'deleted' });
		}
	)
	.get('/inbox/data', async ({ json, req, var: v }) => {
		const uid = v.requestHandler.locals.user?.id;
		const messages = (await v.requestHandler.platform.env.kv_cache.get(
			KV.USER_MESSAGE_READ_DATA(uid),
			'json'
		)) as user_has_read;
		return json(messages ?? defaultUserReadData);
	})
	.post(
		'/inbox/mark/read', // make follower message, site message, book message as consumed
		//	zValidator('json', user_message_data),
		async ({ json, req, var: v }) => {
			//TODO message level mark ? not needed
			const uid = v.requestHandler.locals.user.id;
			let body = await req.json();
			const query = zodClean(user_message_data, body);
			console.log('Saving', query);
			const messages = await v.requestHandler.platform.env.kv_cache.put(
				KV.USER_MESSAGE_READ_DATA(uid),
				JSON.stringify(query)
			);
			return json(query);
		}
	);

export const messageWorker = new Hono().route('/protected', messageApp);
