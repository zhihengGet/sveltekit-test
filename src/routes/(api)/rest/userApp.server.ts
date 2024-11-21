import { profileField, type profilePublic } from '$lib/queries/user/fields';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as z from 'zod';
import type { apiEnv } from './[...paths]/+server';
import { profileSchema } from '$lib/schema/profile';
import { getPublicAvatarUrlSync } from '$lib/queries/storage/ObjectKey';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { KV } from './utils/kv';
import { get_user_event, type UserEvent } from './utils/user_event';
import { cache } from 'hono/cache';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { CustomError } from '$lib/queries/base/errors';
import type { book, chapter } from '$lib/types';
import {
	WordCountHeatmapDay,
	WordCountHeatmapDayOther
} from '$lib/data/constants';

const userHono = new Hono().get(
	'/profile',
	zValidator('query', z.object({ id: z.string().uuid() })),
	async ({ req, json, var: { requestHandler } }) => {
		const id = req.valid('query');
		const uid = requestHandler.locals.user_id;
		if (id.id == uid) return json(requestHandler.locals.profile);
		const profile = await supabaseServer()
			.from('profiles')
			.select(profileField)
			.eq('id', id.id)
			.single();

		if (profile.error) throw profile.error;
		return json(profile.data as profilePublic);
	}
);
const userAppProtected = new Hono()
	.get(
		'/profile',
		zValidator('query', z.object({ id: z.string() })),
		async ({ req, json, var: { requestHandler } }) => {
			const id = req.valid('query');
			const uid = requestHandler.locals.user_id;
			if (id.id == uid) return json(requestHandler.locals.profile);
			const profile = await requestHandler.locals.supabase
				.from('profiles')
				.select(profileField)
				.eq('id', id.id)
				.single();
			if (!profile.data?.avatar_url && !profile.error) {
				profile.data.avatar_url = getPublicAvatarUrlSync({ uid: uid });
			}
			if (profile.error) throw profile.error;
			return json(profile.data as profilePublic);
		}
	)
	.post(
		'/profile',
		zValidator('json', profileSchema.partial().omit({ id: true })),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			query.user_modified_at = new Date().toISOString();
			console.log('update user', query);
			const profile = await requestHandler.locals.supabase
				.from('profiles')
				.update(query)
				.eq('id', uid)
				.select(profileField)
				.single();

			if (profile.error) throw profile.error;
			return json(profile.data as profilePublic);
		}
	)
	.get(
		'/activities/:user',
		zValidator('param', z.object({ user: BigIntIdsZod })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const id = req.valid('param');
			const data = await get_user_event({
				user_ids: [id.user],
				kv: requestHandler.platform.env.kv_cache
			});
			return json(data);
		}
	)

	.get(
		'/recent_creation/:user',
		zValidator('param', z.object({ user: BigIntIdsZod })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const id = req.valid('param');
			const books = await supabaseServer()
				.from('books')
				.select(
					'id,title,tags,category,summary,author_id,chapter_count,chapters(sequence,status,title,updated_at,like_count,id,created_at)'
				)
				.eq('author_id', id.user)
				.limit(3)
				.limit(3, { referencedTable: 'chapters' })
				.eq('chapters.status', 'published')
				.order('id', { ascending: false })
				.order('sequence', { referencedTable: 'chapters', ascending: false });
			if (books.error) {
				throw new CustomError(books.error.message);
			}
			return json(books.data ?? []);
		}
	)
	.get(
		'/word/heatmap',
		zValidator('query', z.object({ user_id: BigIntIdsZod.optional() })),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			let max_day = WordCountHeatmapDay;
			if (query.user_id !== uid) {
				max_day = WordCountHeatmapDayOther;
			}
			const books = await supabaseServer()
				.from('word_count')
				.select('*')
				.eq('user_id', query.user_id || uid)
				.order('time', { ascending: false })
				.limit(max_day);
			if (books.error) {
				throw new CustomError(books.error.message);
			}
			return json(books.data ?? []);
		}
	);
// .post(
// 	'/activities',
// 	zValidator(
// 		'json',
// 		z.object({ user_ids: BigIntIdsZod.array().max(20).min(1) })
// 	),
// 	async ({ req, json, var: { requestHandler } }) => {
// 		const uid = requestHandler.locals.user_id;
// 		const ids = await req.valid('json');
// 		const data = await get_user_event({
// 			user_ids: ids.user_ids,
// 			kv: requestHandler.platform.env.kv_cache
// 		});
// 		return json(data);
// 	}
// );

export const userApp = new Hono()
	.route('/protected', userAppProtected)
	.route('/', userHono)
	.onError((err, c) => {
		console.error('errror in user app', err);
		return c.json(err);
	});
