import * as z from 'zod';

// As JavaScript object
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { CustomError } from '$lib/queries/base/errors';
import { ReviewFieldsCSV } from '$lib/queries/review/fields';
import {
	getReviews,
	getTotalUserReviewCount,
	getUserReview,
	getUserReviews
} from '$lib/queries/review/reviews.server';
import { getPublicAvatarUrl } from '$lib/queries/storage/useUpload';
import { reviewPaginate } from '$lib/schema/querySchema/reviewPagination';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { review_schema } from '$lib/schema/reviewSchema';
import { updateDOStats } from './statsApp.sever';
import { notifyAuthorOnReview } from './utils/event';
import { DO_GEN } from './utils/kv';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { reviewWithUserInfo } from '$lib/types';
import { removeNil } from '$lib/queries/util';
import { genID } from './utils/getUUID';

export const commentRequestSchema = z.object({
	type: z.string().refine((type) => type === 'comment_count'),
	section_ids: z.array(z.string()).transform((v) => {
		if (typeof v === 'string') {
			try {
				return JSON.parse(v).map((v) => v + '');
			} catch (error) {
				// Handle parsing errors (e.g., log, throw, return default value)
				return [];
			}
		}
		return [];
	}),
	chapter_id: BigIntIdsZod // Assuming BigIntIdsZod is a custom Zod schema
});
// base path /api/
export const reviewAppPublic = new Hono()
	.post(
		'/reviews',
		zValidator('json', reviewPaginate),
		async ({ req, env, executionCtx, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const data = await getReviews(query);
			/* if (query.filter.user_id !== uid || !uid) {
			// cache
			return new Response(JSON.stringify(data), {
				headers: {
					'cache-control': 'max-age=120'
				}
			});
		} */
			return json(data);
		}
	)
	.get(
		'/review',
		zValidator(
			'query',
			z.object({
				review_id: BigIntIdsZod
			})
		),
		async ({ req, var: { requestHandler }, json }) => {
			const query = req.valid('query');
			const info = await supabaseServer()
				.from('reviews')
				.select(ReviewFieldsCSV)
				.eq('id', query.review_id)
				.single();
			if (info.error) {
				throw new CustomError(info.error.message);
			}
			return json(info.data);
		}
	);

// base path /api/
export const reviewAppProtected = new Hono()
	.get(
		'/user_reviews/count',
		async ({ req, env, var: { requestHandler }, json }) => {
			const data = await getTotalUserReviewCount();
			return json(data as number | null);
		}
	)
	.post(
		'/user_reviews',
		zValidator('json', reviewPaginate),
		async ({ req, env, var: { requestHandler }, json }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const data = await getUserReviews(query);
			if (query.filter.user_id !== uid || !uid) {
				// cache
				return json(data);
			}
			return json(data as reviewWithUserInfo[]);
		}
	)
	.get(
		'/user_review',
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
	)

	.post(
		'/update_user_info',
		zValidator(
			'json',
			z.object({
				id: BigIntIdsZod,
				type: z
					.string()
					.optional()
					.refine(
						(type) =>
							type === 'review' || type === 'chapter' || type === 'comment'
					),
				is_like: z.boolean().nullable(),
				prev_is_like: z.boolean().nullable()
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const prev = { is_like: query.prev_is_like };
			const info = await requestHandler.locals.supabase
				.from('user_review_data')
				.upsert(
					{
						is_like: query.is_like,
						review_id: query.id,
						user_id: requestHandler.locals.user_id
					},
					{ onConflict: 'review_id,user_id' }
				)
				.select('*')
				.single();
			if (info.error) throw new CustomError(info.error.message);
			// update DO
			await updateDOStats({
				...query,
				curr_is_like: query.is_like,
				prev_is_like: prev?.is_like,
				do_statsCounter: requestHandler.platform!.env.do_statsCounter,
				table: 'reviews'
			});
			return json(info);
		}
	)
	.post(
		'/create',
		zValidator(
			'json',
			review_schema.extend({ username: z.string(), book_id: BigIntIdsZod })
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const username = query?.username;
			console.log(query);
			const { data, error } = await requestHandler.locals.supabase
				.from('reviews')
				.insert({
					...query,
					user_id: uid,
					content: query.content ?? 'empty',
					username: username,
					avatar_url: await getPublicAvatarUrl(),
					id: genID()
				})
				.select()
				.single();

			if (error) throw error;

			requestHandler.platform?.context.waitUntil(
				notifyAuthorOnReview({
					...data,
					do_name: DO_GEN.EVENT_REVIEW_THROTTLER_NAME(data.book_id),
					platform: requestHandler.platform
				})
			);
			return json(data);
		}
	)
	.post(
		'/update',
		zValidator(
			'json',
			review_schema.partial().extend({ book_id: BigIntIdsZod })
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			removeNil(query);
			const { data, error } = await requestHandler.locals.supabase
				.from('reviews')
				.update({
					...query,
					user_modified_at: new Date().toUTCString()
				})
				.eq('book_id', query.book_id)
				.match({ user_id: uid })
				.select(ReviewFieldsCSV)
				.single();

			if (error) throw error;

			return json(data);
		}
	)
	.delete(
		'/delete_review',
		zValidator('json', z.object({ id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;

			const { data, error } = await requestHandler.locals.supabase
				.from('reviews')
				.delete()
				.eq('id', query.id)
				.match({ user_id: uid });

			if (error) throw error;

			return json(200);
		}
	);

export const reviewRouter = new Hono()
	.route('/protected', reviewAppProtected)
	.route('/', reviewAppPublic)
	.onError((v, { json }) => {
		console.log('error in review ', v.message);
		return json(v, 400);
	});
