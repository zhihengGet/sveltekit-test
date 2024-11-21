import { dev } from '$app/environment';
import { extractFeature } from '$lib/cf/geoloation';
import { bookCols, user_book_data_fields } from '$lib/queries';
import { chapterColsExcludeContent } from '$lib/queries/chapter/fields';
import { profilePublicField } from '$lib/queries/user/fields';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import type { book, min_chapter } from '$lib/types/index';
import type { UserAgent } from '@edge-runtime/user-agent';
import { error, redirect } from '@sveltejs/kit';
import {
	addMilliseconds,
	differenceInMilliseconds,
	format,
	isAfter
} from 'date-fns';
import type postgres from 'postgres';
import { isBookPermitted } from '../../../(api)/rest/bookApp.server';
import { verifyPreviewId } from '../../../(api)/rest/previewApp.server';
import { updateBook } from '../../../(api)/rest/statsApp.sever';
import { queryAnalytics } from '../../../(api)/rest/worker_query_util.server';
import type { PageServerLoad, RouteParams } from './$types';
import { type globalThrottleInterval } from '$lib/types/external';

let last_click_updated = null;

export const load: PageServerLoad = async ({
	params,
	platform,
	request,
	url,
	locals: { supabase, user_id, userAgent }
}) => {
	console.log('page.server.ts ', params, request.url);
	if (params.book_id && BigIntIdsZod.parse(params.book_id)) {
		let pid = url.searchParams.get('preview_session_id');
		const uid = user_id;
		let chapter_list: min_chapter[] = [];
		const sql = sqlInstance();
		if (pid) {
			const preview = await verifyPreviewId({
				book_id: params.book_id,
				preview_id: pid,
				chapter_id: null
			}).catch((v) => null);
			if (!preview) {
				// invalid
				redirect(302, url.origin + url.pathname);
			}
			chapter_list = await sql`
				select ${sql(chapterColsExcludeContent.split(','))}
				from chapters
				where book_id =${params.book_id} ${
					preview.isSingleChapter
						? sql`and status ='published' or id=${preview.chapter_id}`
						: sql``
				}
			`;
		}

		const cacheUrl = new URL(request.url + '?cacheResponse=10');

		const cacheKEY = new Request(cacheUrl, {});
		//TODO need a way to invalidate cache when author pubblish
		/* if (cache) {
			console.log('Cache Hit');
			let res = (await cache.json()) as {
				book: book & { chapters: min_chapter[] };
				author: profilePublic;
			};
			const r = gen_data({
				book: res.book,
				req: request
			});
			platform?.env.BOOKS?.writeDataPoint({
				blobs: [
					r.book_id + '',
					r.metadata,
					userAgent.device.type ?? userAgent.browser.name ?? 'Electronic',
					r.created_at
				], //book country
				doubles: [1],
				indexes: [params.book_id]
			});
			platform?.context.waitUntil(
				handle_book_stats(res.book, request, platform, userAgent, params)
			);
			
			return res;
		} 
			console.log('cache miss');	
		*/

		const { data, error: e } = await supabaseServer()
			.from('books')
			.select(`${bookCols},user_book_data(${user_book_data_fields})`)
			.eq('id', params.book_id)
			.eq(
				'user_book_data.user_id',
				uid ?? '00000000-0000-0000-0000-000000000000'
			)
			.single();

		console.log('Getting book with user book data', data, e);
		if (!data || e) error(404, 'book not found');
		await isBookPermitted({
			book: data,
			kv_cache: platform!.env.kv_cache,
			book_id: data.id,
			user_id: uid
		});
		const r = gen_data({
			book: data,
			req: request
		});
		platform?.env.BOOKS?.writeDataPoint({
			blobs: [
				r.book_id + '',
				r.metadata,
				userAgent.device.type ?? userAgent.browser.name ?? 'Electronic',
				r.created_at
			], //book country
			doubles: [1],
			indexes: [params.book_id]
		});
		// service role does not bypass row limit imposed, need to use direct postgres conn
		const list: min_chapter[] = chapter_list.length
			? chapter_list
			: await sql`
			select ${sql(chapterColsExcludeContent.split(','))}
			from chapters 
			where book_id = ${params.book_id} and (status = 'published')
		`;
		const book = { chapters: list, ...data };
		const author_data = await supabase
			.from('profiles')
			.select(profilePublicField)
			.eq('id', book.author_id)
			.single();
		if (author_data.error || !author_data)
			return error(500, { message: 'Failed to retrieve author info' });

		platform?.context.waitUntil(
			platform.caches.default.put(
				cacheKEY,
				new Response(JSON.stringify({ book, author: author_data.data }), {
					status: 200,
					headers: { 'Cache-control': 's-maxage=30' }
				})
			)
		);

		platform?.context.waitUntil(
			handle_book_stats(book, request, platform, userAgent, params)
		);
		return { book, author: author_data.data };
	}
	return error(400, { message: 'Invalid Book Id' });
};
import { throttlerRPC } from '../../../(api)/rest/utils/event';
import { scheduleBookStatsUpdate } from '../../../(api)/rest/utils/middleware.server';
import { DO_GEN } from '../../../(api)/rest/utils/kv';
import { DisposeRPC } from '../../../(api)/rest/utils/chat';

async function handle_book_stats(
	book: book,
	request: Request,
	platform: Readonly<App.Platform>,
	userAgent: UserAgent,
	params: RouteParams
) {
	if (!platform!.env.do_throttler?.idFromName) {
		console.warn('failed to get throttler, cannot update book stats');
		return;
	}
	try {
		console.log('start handle book stats update');
		let throtlte = await throttlerRPC({
			name: DO_GEN.UPDATE_BOOK_STATS(book.id),
			platform: platform,
			reason: 'ui_book_page_stats_update'
		});
		let book_throttle = await throtlte?.checkState({ key: '30min' });
		let click_throttle = await throtlte?.checkState({ key: '30min' });
		console.log(
			'book page visisted, check if we need to update stats',
			'should update book stats',
			book_throttle,
			'should click agg',
			click_throttle
		);
		await DisposeRPC(click_throttle);
		await DisposeRPC(book_throttle);
		console.log('trashed stubs, heres throttle info', throtlte);
		if (book_throttle?.after || dev) {
			platform?.context.waitUntil(
				scheduleBookStatsUpdate({
					book_id: book.id,
					requestHandler: { platform }
				})
			);
		}
		if (click_throttle?.after || dev)
			platform?.context.waitUntil(
				update_book_stats_and_count({
					last_date: click_throttle?.prev,
					book,
					sqlFn: sqlInstance
				})
			);
	} catch (e) {
		console.error('error with update book stats', e);
	}
}

// cron update books total_click on user visits

async function update_book_stats_and_count({
	book,
	last_date,
	sqlFn
}: {
	book: book;
	last_date: number;
	sqlFn: () => postgres.Sql;
}) {
	console.log('updating book click', book.id, last_date);
	//TODO use cf worker anlytic does not work with throttler because writeDataPoint is not done yet, when we try to query, it is still pending.
	// see ./design.png
	const clicks = (await queryAnalytics(`
			SELECT
			sum(_sample_interval * double1) AS total_click
			FROM
				BOOKS
			WHERE
				blob1 = '${book.id}'
				AND timestamp > toDateTime(${last_date / 1000})
				
			`)) as { data: [{ total_click: number }] };
	console.log('updating daily clicks', last_date / 1000, clicks);
	if (clicks.data?.[0]?.total_click > 0) {
		await sqlFn()`update books set total_click=total_click+${clicks.data[0].total_click}  where id=${book.id}`;
	}
}
function gen_data({
	book,
	req
}: {
	book: book;

	req: Request;
}) {
	const today = format(new Date(), 'yyyy-MM-dd');
	//await sql`select system_events.update_book_children(${book.id})`;
	const { continent, country } = extractFeature.feat(req);
	console.log(country);
	const d = {
		created_at: today,
		clicks: 1,
		author_id: book.author_id,
		book_id: book.id,
		metadata: country || 'earth'
	};

	return d;
}
