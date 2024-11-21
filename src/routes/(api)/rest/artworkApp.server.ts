import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { artworkColsJoinedBook } from '$lib/queries/storage/fields';
import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
	BigIntIdsZod,
	genZodSchemaObject
} from '$lib/schema/querySchema/zodPagination';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import {
	artwork_user_data_create_schema,
	artwork_user_data_update_schema
} from '$lib/schema/artworkSchema';
import { updateDOStats } from './statsApp.sever';

const bigIntIds = z.union([z.number(), z.string()]).nullable();
const filter = z
	.object({
		artwork_id: z.string(),
		book_id: bigIntIds,
		chapter_id: bigIntIds,
		name: z.string(),
		user_id: z.string(),
		ai: z.boolean().nullish().default(false),
		endorsed: z.boolean()
	})
	.partial();
const schema = genZodSchemaObject(filter);
const artworkPublic = new Hono<apiEnv>().post(
	'/getArtworks',
	zValidator('json', schema),
	async ({ req, json, var: { requestHandler } }) => {
		/* console.log('user', requestHandler.locals.session, req.valid('json')); */
		/* const uid = await requestHandler.locals.user?.id;
		if (!uid) return json(null, 403); */
		const param = req.valid('json');
		//param.filter.user_id = uid;
		let builder = requestHandler.locals.supabase
			.from('artworks')
			.select(artworkColsJoinedBook)
			.match(param.filter)
			.range(param.paginate.start, param.paginate.end - 1);

		if (param.search?.regex)
			builder = builder.ilike('name', '%' + param.search?.regex + '%');
		if (param.paginate.orderWithMultiple) {
			for (let x in param.paginate.orderWithMultiple) {
				builder = builder.order(x, {
					ascending: param.paginate.orderWithMultiple?.[x]?.asc ?? true
				});
			}
		}

		const data = await builder;
		if (data.error) throw data.error;
		return json(data.data);
	}
);
const artworkProtected = new Hono<apiEnv>()
	.post(
		'/endorse',
		zValidator(
			'json',
			z.object({ artwork_id: z.string(), endorsed: z.boolean() })
		),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			console.log('user', requestHandler.locals.session, req.valid('json'));
			const uid = requestHandler.locals.user?.id;
			if (!uid) return json(null, 403);
			/// Get author id of the book
			const author_id = await requestHandler.locals.supabase
				.from('artworks')
				.select('books!inner(author_id)')
				.eq('artwork_id', query.artwork_id)
				.single();
			if (author_id.error) {
				throw new Error(author_id.error.message);
			}
			const id = author_id.data.books.author_id;
			if (id === uid) {
				// current user is the owner of the book
				await supabaseServer()
					.from('artworks')
					.update({ endorsed: query.endorsed })
					.eq('artwork_id', query.artwork_id);

				return json({ message: 'successful' });
			}

			return json({ message: 'Unauthorized' }, 403);
		}
	)

	.post(
		'/upsert_user_info',
		zValidator(
			'json',
			artwork_user_data_create_schema.merge(
				z.object({ prev_is_like: z.boolean().nullable() })
			)
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			console.log('fetch prev user info');
			let old = { is_like: query.prev_is_like };
			const user_info = await supabaseServer()
				.from('user_artwork_data')
				.upsert(
					{
						artwork_id: query.artwork_id,
						is_like: query.is_like,
						user_id: requestHandler.locals.user!.id
					},
					{ onConflict: 'artwork_id,user_id' }
				)
				.select('*')
				.single();
			if (user_info.error) {
				throw user_info.error;
			}
			// update DO
			await updateDOStats({
				id: query.artwork_id,
				curr_is_like: query.is_like,
				prev_is_like: old.is_like,
				do_statsCounter: requestHandler.platform!.env.do_statsCounter,
				table: 'artworks'
			});
			return json(user_info.data);
		}
	)
	.post(
		'/fileUpload',
		zValidator('json', artwork_user_data_create_schema),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {}
	)
	.delete(
		'/delete',
		zValidator(
			'json',
			z.object({
				book_id: BigIntIdsZod,
				artwork_id: z.string(),
				chapter_id: BigIntIdsZod.optional()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const payload = { type: 'artwork', ...query };
			const uid = requestHandler.locals.user_id;
			// delete from R2
			const r = await requestHandler.locals.supabase
				.from('artworks')
				.delete()
				.eq('artwork_id', query.artwork_id)
				.eq('user_id', uid);
		}
	);
export const artworkApp = new Hono()
	.route('/protected', artworkProtected)
	.route('/', artworkPublic);
