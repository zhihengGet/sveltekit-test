import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { head } from 'lodash-es';
import { MAX_FOLLOWED_AUTHOR } from '$lib/data/constants';
import { CustomError } from '$lib/queries/base/errors';

const protectedApp = new Hono()
	.get(
		'/count',
		zValidator('query', z.object({ user_id: z.string() })),
		async ({ json, var: { requestHandler } }) => {}
	)
	.post(
		'/subscribe',
		zValidator(
			'json',
			z.object({ user_id: z.string(), is_follow: z.boolean() })
		),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const count = await supabaseServer()
				.from('user_profile_data')
				.select('*', { count: 'exact', head: true });

			if (count.error) {
				throw new CustomError(count.error.message);
			}
			if (count.count > MAX_FOLLOWED_AUTHOR) {
				throw new CustomError(
					'You can only follow ' + MAX_FOLLOWED_AUTHOR + ' Author'
				);
			}
			const data = await supabaseServer()
				.from('user_profile_data')
				.upsert({
					self: uid,
					target: query.user_id,
					is_follower: query.is_follow,
					user_modified_at: new Date().toUTCString()
				})
				.select('*')
				.single();
			if (data.error) {
				throw data.error;
			}
			return json(data.data);
		}
	)
	.post(
		'/unsubscribe',
		zValidator('query', z.object({ user_id: z.string() })),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			const uid = requestHandler.locals.user_id;
			const data = await supabaseServer()
				.from('user_profile_data')
				.update({
					self: uid,
					target: query.user_id,
					is_follower: false,
					user_modified_at: new Date().toUTCString()
				})
				.select('*')
				.single();
			if (data.error) {
				throw data.error;
			}
			return json(data.data);
		}
	)
	.get('/followee', async ({ json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user_id;
		const data = await supabaseServer()
			.from('user_profile_data')
			.select('*')
			.eq('self', uid);
		return json(data.data);
	});

export const followerApp = new Hono()
	.route('/protected', protectedApp)
	.route('/public', protectedApp)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});
