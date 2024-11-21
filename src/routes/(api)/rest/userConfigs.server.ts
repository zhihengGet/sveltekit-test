import * as z from 'zod';

// As JavaScript object
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY } from '$lib/data/constants';
import type { readerTheme } from '$lib/data/filter/readerPersonalize';
import { CustomError } from '$lib/queries/base/errors';
import { review_user_actions } from '$lib/queries/review/review_user.server';
import { getUserReview } from '$lib/queries/review/reviews.server';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { sleep } from '$lib/utils/sleep';
import type { apiEnv } from './[...paths]/+server';
import { updateDOStats } from './statsApp.sever';
import { KV } from './utils/kv';
import { themeConfigSchema } from '../../(main)/reader/[book_id]/[chapter_id]/store.svelte';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { editor_setting, user_editor_setting } from '$lib/types';

export const settingProtected = new Hono<apiEnv>()
	.get(
		'/setting_global',
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const settings = await requestHandler.locals.supabase
				.from('user_global_configs')
				.select('*')
				.eq('user_id', uid)
				.maybeSingle();
			if (settings.error) {
				throw new CustomError(settings.error.message);
			}
			if (!settings.data) {
				const data = await requestHandler.locals.supabase
					.from('user_global_configs')
					.insert({
						user_id: uid,
						is_beta_reader: true,
						max_author_invitation_per_day:
							DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY
					})
					.select('*')
					.single();
				if (data.error) {
					throw new CustomError(data.error.message);
				}
				return json(data.data);
			}
			return json(settings.data);
		}
	)
	.post(
		'/setting_global',
		zValidator(
			'json',
			z.object({
				max_author_invitation_per_day: z.number().max(100),
				is_beta_reader: z.boolean(),
				author_invitation_count: z.number().nullish() //FIXME when max count update to a lower number, we should lower current_count ? but leave it to DO updates for now
			})
		),
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('json');
			const data = await requestHandler.locals.supabase
				.from('user_global_configs')
				.update({
					user_id: uid,
					is_beta_reader: query.is_beta_reader,
					max_author_invitation_per_day: query.max_author_invitation_per_day
				})
				.eq('user_id', uid)
				.single();
			if (data.error) {
				throw new CustomError(data.error.message);
			}
			return json(200);
			//			return json(data.data);
		}
	)
	.post(
		'/book_theme',
		zValidator(
			'json',
			z.object({
				book_theme: themeConfigSchema,
				book_id: BigIntIdsZod
			})
		),
		async ({ req, env, var: { requestHandler }, json }) => {
			const data = req.valid('json');
			const uid = requestHandler.locals.user_id;

			const kv = requestHandler.platform?.env.kv_cache;
			await sleep(600); // KV has put limit 1req/s
			const r = await kv?.put(
				KV.BOOK_THEME(uid, data.book_id),
				JSON.stringify(data.book_theme)
			);
			return json('Success!');
		}
	)
	.get(
		'/user_editor_setting/:book_id',
		zValidator(
			'param',
			z.object({
				book_id: BigIntIdsZod
			})
		),
		async ({ req, env, var: { requestHandler }, json }) => {
			const query = req.valid('param');
			const uid = requestHandler.locals.user_id;
			//delete props.secret_key;
			const { data, error } = await supabaseServer()
				.from('user_editor_settings')
				.select('*')
				.eq('user_id', uid)
				.eq('book_id', query.book_id)
				.maybeSingle();
			if (error) throw error;
			return json(data as editor_setting);
		}
	)
	.patch(
		'/user_editor_setting',
		zValidator(
			'json',
			z.object({
				book_id: BigIntIdsZod,
				setting: z.record(z.string(), z.any())
			})
		),
		async ({ req, env, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			//delete props.secret_key;
			const { data, error } = await supabaseServer()
				.from('user_editor_settings')
				.upsert(
					{ user_id: uid, setting: query.setting, book_id: query.book_id },
					{ onConflict: 'user_id,book_id' }
				)
				.eq('user_id', uid)
				.eq('book_id', query.book_id)
				.select('*')
				.single();
			if (error) throw error;
			return json(data as user_editor_setting);
		}
	)
	/* 	.get(
		'/query_setting',
		zValidator('query', z.object({ type: z.string(), id: BigIntIdsZod })),
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const settings = await requestHandler.locals.supabase
				.from('user_global_configs')
				.select('*')
				.eq('user_id', uid)
				.single();

			if (settings.error) {
				throw new CustomError(settings.error.message);
			}
			if (!settings.data) {
				const data = await requestHandler.locals.supabase
					.from('user_global_configs')
					.insert({
						user_id: uid,
						is_beta_reader: true,
						max_author_invitation_per_day: 20
					})
					.select('*')
					.single();
				if (data.error) {
					throw new CustomError(data.error.message);
				}
				return json(data.data);
			}
			return json(settings.data);
		}
	) */

	.get(
		'/book_theme',
		zValidator('query', z.object({ book_id: BigIntIdsZod })),
		async ({ req, env, var: { requestHandler }, json }) => {
			const data = req.valid('query');
			const uid = requestHandler.locals.user_id;
			const settings = (await requestHandler.platform?.env.kv_cache.get(
				KV.BOOK_THEME(uid, data.book_id)
			)) as string;

			return json(JSON.parse(settings) as readerTheme | null);
		}
	)
	.get('/shelf_tags', async ({ req, env, var: { requestHandler }, json }) => {
		const uid = requestHandler.locals.user_id;
		const settings = await requestHandler.locals.supabase
			.from('user_global_configs')
			.select('*')
			.eq('user_id', uid);
		return json(settings);
	})
	.get(
		'/author_book_tags',
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const settings = await requestHandler.locals.supabase
				.from('user_global_configs')
				.select('*')
				.eq('user_id', uid);
			return json(settings);
		}
	)
	.get('/site_css', async ({ req, env, var: { requestHandler }, json }) => {
		const uid = requestHandler.locals.user_id;
		const settings = await requestHandler.locals.supabase
			.from('user_global_configs')
			.select('*')
			.eq('user_id', uid);
		return json(settings);
	})
	.get(
		'/user_setting_global',
		async ({ req, env, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const settings = await requestHandler.locals.supabase
				.from('user_global_configs')
				.select('*')
				.eq('user_id', uid);
			return json(settings);
		}
	)
	.post(
		'/user_book_setting',
		//zValidator('query', z.object()),
		async ({ req, env, var: { requestHandler }, json }) => {}
	)
	.get(
		'/author_setting',
		zValidator(
			'query',
			z.object({
				book_id: BigIntIdsZod
			})
		),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const uid = requestHandler.locals.user_id;
			const query = req.valid('query');
			const info = await getUserReview(query.book_id);

			return json(info);
		}
	);

export const SettingApp = new Hono()
	.route('/protected', settingProtected)
	.onError((e, { json }) => {
		if (e instanceof z.ZodError) {
			return json(e);
		}
		return json(e);
	});
