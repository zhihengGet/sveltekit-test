import { CustomError } from '$lib/queries/base/errors';
import { tradeSchema } from '$lib/schema/tradeschema';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { apiEnv } from './[...paths]/+server';
import { verifyPreviewId } from './previewApp.server';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';

export const booksAppProtected = new Hono()
	.post(
		'/start_trade_reviews',
		zValidator(
			'json',
			z.object({
				preview_id: z.string(),
				book_id: BigIntIdsZod,
				preview_id_opponent: z.string()
			})
		),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			const preview = await supabaseServer()
				.from('previews')
				.select('*')
				.eq('id', query.preview_id)
				.single();
			const owner = await supabaseServer()
				.from('trade_reviews')
				.insert({
					book_id_from: preview.data?.book_id,
					book_id_to: query.book_id,
					user_id_from: uid,
					user_id_to: preview.data?.user_id,
					preview_id: preview.data?.id
				})
				.select('*')
				.single();
			if (owner.error) {
				throw new CustomError(owner.error.message);
			}
			return json({ message: 'saved' });
		}
	)
	.get(
		'/trade_records',
		zValidator(
			'json',
			tradeSchema
				.omit({ preview_id: true })
				.merge(z.object({ offset: z.number(), completed: z.boolean() }))
		),
		async ({ json, req, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user!.id;
			const other_party_id = await sqlInstance()`
				select 
				
				(from.review_id is not null and t.review_id is not null) as completed
				t.user_id_from as user_id_to
				from.review_id as your_review_id
				t.review_id as review_id_for_you
				from.book_id_to as your_book,
				from.book_id_from as his_book

				from trader_reviews as from 
				inner join trader_reviews as t on 
					t.user_id_from = from.user_id_to and
					t.user_id_to = from.user_id_from and
					t.book_id_to = from.book_id_from and 
					t.book_id_from = from.book_id_to
				where from.user_id_from = ${uid} and ${query.completed ? `from.review_id is not null and t.review_id is not null` : 'from.review_id is null or t.review_id is null'}
				order by created_at desc
				offset ${query.offset} limit 5
			`;

			return json(200);
		}
	);

export const tradeReviewApp = new Hono()
	.route('/protected', booksAppProtected)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});
