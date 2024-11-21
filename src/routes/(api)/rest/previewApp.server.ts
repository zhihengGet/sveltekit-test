import { Hono } from 'hono';
import { extractFeature } from '$lib/cf/geoloation';
import { SITE_URL } from '$lib/data/constants';
import { CustomError } from '$lib/queries/base/errors';
import { generatePreviewURL } from '$lib/queries/preview/usePreview';
import {
	previewQuerySchemaGet,
	previewURLCreateSchema,
	previewURLSchema
} from '$lib/schema/querySchema/previewSchema';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { zValidator } from '@hono/zod-validator';
import {
	addHours,
	addMilliseconds,
	addYears,
	format,
	formatDistance,
	isAfter,
	isBefore
} from 'date-fns';
import { isNil } from 'lodash-es';
import { z } from 'zod';
import { sendNotifyOnReviewEmail } from './sendEmail.server';
import { queryAnalytics } from './worker_query_util.server';
import { removeNil } from '$lib/queries/util';
import type { previews } from '$lib/types';
import type { apiEnv } from './[...paths]/+server';
import { genID } from './utils/getUUID';
import crypto from 'crypto';
const schema = z.object({
	preview_id: z.string().uuid({ message: 'Invalid Preview Id' }),
	book_id: BigIntIdsZod,
	chapter_id: BigIntIdsZod.nullish()
});
/* 
  @description preview level = click count by timestamp , device used
*/
function record(params: {
	PREVIEW_LINKS: AnalyticsEngineDataset;
	request: RequestInit;
	preview_id: string;
	book_id: any;
	chapter_id: any;
}) {
	const feat = extractFeature.fetch(params.request);
	// clicks, country,device/browser on preview key level

	params.PREVIEW_LINKS.writeDataPoint({
		indexes: [params.preview_id],
		blobs: [
			feat.country,
			format(Date.now(), 'yyyy-MM-dd'),
			params.book_id,
			params.chapter_id,
			feat.continent,
			feat.timezone
		], // country, state, username,
		doubles: [1] // visit,date
	});
}
export async function verifyPreviewId({
	preview_id,
	chapter_id = null,
	book_id
}: {
	preview_id?: number | string;
	chapter_id?: number | string | null;
	book_id: number | string;
}) {
	const valid_id = schema.safeParse({ preview_id, book_id, chapter_id });
	if (valid_id.error || !preview_id) {
		throw new Error(valid_id?.error?.issues.map((v) => v.message).join(','));
	}
	//const uid = await getUserIDFromLocalStorage();
	//TODO user need to be logged in check? no because we want people to read it easily
	//FIXME check if user is emailed user?
	const preview = await supabaseServer()
		.from('previews')
		.select('*')
		.eq('id', valid_id.data.preview_id)
		.eq('book_id', book_id)
		.single();
	if (preview.error) {
		throw new Error('unable to find preview in db', { cause: preview.error });
	}
	const { ttl, created_at, description } = preview.data;
	console.log('diff', preview, chapter_id, book_id);
	if (isNil(chapter_id) === false && preview.data.chapter_id != chapter_id) {
		throw new CustomError('Preview Rejected - Invalid Book Id/Chapter Id');
	}

	const isExpired = isBefore(
		ttl * 3600 * 1000 + new Date(created_at).getTime(),
		Date.now()
	);
	const gap = formatDistance(
		addMilliseconds(new Date(), ttl * 3600000),
		Date.now()
	);
	if (isExpired) {
		console.log('deleting expired prevew session');
		const del = await supabaseServer()
			.from('previews')
			.delete()
			.eq('id', preview_id);
		if (del.error) console.error('failed to delete preview', del);
		throw new Error('Preview Id Expired ' + gap);
	}
	return {
		preview: preview.data,
		isSingleChapter: typeof preview.data.chapter_id === 'number',
		expireIn: formatDistance(
			addMilliseconds(new Date(), ttl * 3600000),
			Date.now()
		),
		url: generatePreviewURL({ book_id, chapter_id, id: preview_id }),
		book_id,
		chapter_id: preview.data.chapter_id,
		created_at
	};
}

function preview_id({ book_id }: { book_id: number | string }) {
	return book_id + crypto.randomUUID();
}
function formatYY(day) {
	return format(day, 'yyyy-MM-dd');
}

export function updatePreviewClicks() {}
export function createPreviewKV(props: {
	kv: KVNamespace;
	book_id: number | string;
	chapter_id?: string | null | number;
	ttl: number;
}) {
	const timestamps: { [s in string]: number } = {};
	for (let x = 0; x < Math.ceil(ttl ?? 0 / 24); x++) {
		let s = formatYY(Date.now() + x);
		timestamps[s] = 0;
	}
	props.kv.put(
		preview_id({ book_id: props.book_id }),
		JSON.stringify({
			book_id: props.book_id,
			chapter_id: props.chapter_id,
			emailed: [],
			reviewed: [],
			commented: [],
			daily_view: timestamps,
			total_views: 0,
			expiredAt: addHours(new Date(), props.ttl)
		}),
		{ expirationTtl: props.ttl * 3600 }
	);
}
export function deletePreviewKV() {}
export async function notifyAuthorOnPreviewReview(props: {
	book_title: string;
	book_id: number | string;
	kv: KVNamespace;
	user_email: string;
	preview_key: string;
}) {
	// check if user is accepted to beta review by author
	const book = await supabaseServer()
		.from('books')
		.select('title,created_at')
		.match({ id: props.book_id })
		.single();

	if (
		book.data &&
		isAfter(new Date(), addYears(new Date(book.data.created_at), 1)) // 1 year range
	) {
		// this user were invited  to beta review
		await sendNotifyOnReviewEmail({
			to: props.user_email,
			html: `A beta reader wrote a review for your book ${props.book_title} <a href="${SITE_URL}/book/${props.book_id}">click here to read </a>`
		});
	}
}
// base path /api/
export const urlProtected = new Hono<apiEnv>()
	.post(
		'/create',
		zValidator('json', previewURLCreateSchema),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			console.log('query', query);
			const uid = requestHandler.locals.user?.id;
			//if(!uid) {return json("missing user id",403)}
			const supabase = requestHandler.locals.supabase;

			const kv = requestHandler.platform?.env.kv_cache;
			const preview_count = await supabase
				.from('previews')
				.select('*', { count: 'exact' })
				.match({ user_id: uid });
			if (preview_count.count > 100) {
				throw new CustomError('You can only create up to 100 previews');
			}
			//TODO if we remove RLS then we need to check book
			query.ttl = query.ttl || 1;

			if (query.type === 'book') {
				query.chapter_id = null;
			}
			const count = await supabase
				.from('previews')
				.insert({
					ttl: query.ttl,
					user_id: uid,
					description: query.description,
					book_id: query.book_id,
					chapter_id: query.chapter_id,
					name: query.name,
					id: genID()
				})
				.select('*')
				.single();

			if (count.error) {
				return json(count.error, count.status);
			}
			/* 	if (kv) createPreviewKV({ kv: kv, ...query }); */
			return json(count.data as previews);
		}
	)
	.post(
		'/list',
		zValidator('json', previewQuerySchemaGet),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user!.id;
			const supabase = requestHandler.locals.supabase;
			const query = req.valid('json');
			let builder = supabase
				.from('previews')
				.select('*')
				.eq('book_id', query.filter.book_id)
				.eq('user_id', uid)
				.range(query.paginate.start, query.paginate.end - 1);

			if (query.filter.chapter_id !== undefined) {
				if (query.filter.chapter_id === null) {
					builder.is('chapter_id', query.filter.chapter_id);
				} else builder.eq('chapter_id', query.filter.chapter_id);
			}
			const count = await builder;
			if (count.error) {
				return json(count.error, 400);
			}
			return json(count.data);
		}
	)
	.delete(
		'/delete',
		zValidator('json', previewURLSchema),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			console.log(query);
			removeNil(query);
			const count = await supabaseServer()
				.from('previews')
				.delete()
				.match({ ...query, user_id: requestHandler.locals.user!.id });
			if (count.error) {
				return json(count.error, count.status);
			}
			return new Response(JSON.stringify(count.data));
		}
	)
	.get(
		'/stats/preview_list_stats',
		async ({ req, json, var: { requestHandler } }) => {
			const sql = requestHandler.locals.sql();
			const a = {
				title: 'Kid',
				id: '11830644-c409-49ba-8e32-902be09f757f',
				name: null,
				book_id: '170',
				chapter_id: null,
				invited_user_count: null,
				reviewed_user_count: '0'
			};
			const ret: (typeof a)[] = await sql`
				select 
				books.title,
				previews.id,
				previews.name,
				previews.book_id,
				previews.chapter_id,
				array_length(previews.user_ids,1) as invited_user_count,
				count(reviews.id) as reviewed_user_count

				from previews
				inner join books on books.id=previews.book_id
				left join reviews on books.id= reviews.id and  reviews.user_id = any(previews.user_ids)

				group by books.title,previews.id

			`;
			return json(ret);
		}
	)
	.get(
		'/stats/get_clicks_per_day',
		zValidator('query', z.object({ preview_id: z.string().uuid() })),
		async ({ req, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			console.log('query', query);
			const res: {
				meta: [];
				data: { click: number; day: string }[];
				rows: number;
				rows_before_limit_at_least: number;
			} = await queryAnalytics(
				"select sum( double1 * _sample_interval) as click, blob2 as day from PREVIEW_LINKS where timestamp < NOW() - INTERVAL '80' day and index1 = '" +
					query.preview_id +
					"'  GROUP BY blob2 "
			);
			return json(res.data);
		}
	);
export const shareablePreviewURLApp = new Hono()
	.route('/protected', urlProtected)
	.onError((e, c) => {
		console.log('error', e);
		return c.json(e, 400);
	});
