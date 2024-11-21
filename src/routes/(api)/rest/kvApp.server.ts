import { bookCols } from '$lib/queries';
import { CustomError } from '$lib/queries/base/errors';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabase } from '$lib/supabaseClient/client';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { apiEnv } from './[...paths]/+server';
import { KV } from './utils/kv';
import { DEFAULT_BOOK_CONFIGURATION } from './bookApp.server';

const DEFAULT = {};
type socials = {
	twitter: string;
	meta: string;
	reddit: string;
	patreon: string;
};
export const booksAppProtected = new Hono<apiEnv>().post(
	'/shelf/book_tags',
	async ({ req, json, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user?.id;
		const id = uid;
		if (id) {
			let builder = supabase.from('books').select(bookCols).eq('author_id', id);
			const { data, error } = await builder;
			console.log('getAuthoredBooks', data, error);
			if (error) throw error;
			return json(data);
		}
		return json([]);
	}
);

const publicApp = new Hono<apiEnv>().get(
	'/user/shelf/book_tags',
	zValidator('query', z.object({ book_id: BigIntIdsZod })),
	async ({ json, req, var: { requestHandler } }) => {
		const query = req.valid('query');
		//const uid = requestHandler.locals.user!.id;
		const setting: socials =
			(await requestHandler.platform?.env.kv_cache.get(
				KV.AUTHOR_SETTING_BOOK_LEVEL(query.book_id),
				'json'
			)) ?? DEFAULT_BOOK_CONFIGURATION;

		return json(setting);
	}
);
export const booksApp = new Hono<apiEnv>()
	.route('/', publicApp)
	.route('/protected', booksAppProtected)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});
