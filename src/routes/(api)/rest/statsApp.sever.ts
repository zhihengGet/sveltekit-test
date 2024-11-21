import { STATS_COUNTER_API_SECRET_TOKEN } from '$env/static/private';
import { SITE_URL } from '$lib/data/constants';
import type { table_names } from '$lib/types';
import { zValidator } from '@hono/zod-validator';
import { isBefore } from 'date-fns';
import { Hono } from 'hono';
import type postgres from 'postgres';
import { enum as AraryOne, number, object, string, union } from 'zod';
import type {
	globalThrottleInterval,
	globalThrottleIntervalInput,
	statsCounter
} from '$lib/types/external';
import { DO_GEN, KV, type KV_API_CONFIG } from './utils/kv';
import type { apiEnv } from './[...paths]/+server';
import { syncToSearchEngine } from './utils/middleware.server';

type props = {
	id: string;
	sql: postgres.Sql;
};
export async function updateBook({ id, sql }: props) {
	// update book rating,like,
	const a = updateBookRating({ id, sql });
	const update_shelve = updateShelfCount({ sql, id });
	const update_like_dislike = updateBookBasedOnChapter({ id, sql });
	const res = await Promise.allSettled([a, update_shelve, update_like_dislike]);
	await syncToSearchEngine({ book_id: id });
	console.log('update stats test ', res);
}
export async function updateBookRating({ id, sql }: props) {
	console.log('update book average review stats');
	const a = await sql`
	update books set  review_count=total.numOfReviews, 
	  level_of_immersion_rating=total.a, plot_rating=total.b,world_setting_rating=total.c, character_development_rating=total.d,
	  writing_rating=total.e , statistics_modified_at=now()

	 from (select count(*) as numOfReviews, avg(level_of_immersion_rating) as a,
	 avg(plot_rating) as b,avg(world_setting_rating) as c, avg(character_development_rating) as d,avg(writing_rating) as e 
	 from reviews where book_id=${id}) as total
	 where id=${id} and total.numOfReviews > 0 ;
 `;
	return a;
}
export async function updateShelfCount({ id, sql }: props) {
	const update_shelve = await sql`
	-- update shelved count,like dislike
	update books set shelved_count=total.s
	
	from (select count(is_shelved=true)  filter (where is_shelved = true)   as s

	  from user_book_data where ${id}=book_id and is_shelved=true) as total 
	  
	 where id=${id} and total.s >=0;
`;
	return update_shelve;
}
export async function updateBookBasedOnChapter({ id, sql }: props) {
	const update_like_dislike = sql`
	-- update shelved count,like dislike
 	update books set like_count=total.a, dislike_count=total.b, character_count=total.c,word_count=total.e, chapter_count=total.f
		from (select greatest(sum( case when like_count is null then 0 else like_count end ),0) as a, 
		             coalesce(sum(case when dislike_count is null then 0 else dislike_count end),0) as b,
					 greatest(sum( case when character_count is null then 0 else character_count end ),0) as c,
					 coalesce(sum( case when word_count is null then 0 else word_count end ),0) as e,
					 count(1) as f
					from chapters where ${id}=book_id and status ='published') as total
		where id=${id} ;
	`;
	const res = await Promise.allSettled([update_like_dislike]);
	console.log('update book chapter', res);
}
export async function updateReview({ id, sql }: props) {
	// update book rating,like,

	const res = await sql`
		update reviews 
		set like_count = case when t.count is null then 0 else t.count end,
		dislike_count = case when t.dc is null then 0 else t.dc end,
		statistics_modified_at=getutc()
		from 
			(	
				select 
				sum(1) filter (where is_like=true) as count,
				sum(1) filter (where is_like=false) as dc
				from user_review_data
				where review_id=${id}
			) as t
		where id = ${id}
		returning like_count,dislike_count
	`;
	return res[0];
}
export async function updateChapter(props: props) {
	// update review like,dislike
	const res = await props.sql`
		update chapters 
		set like_count = case when t.count is null then 0 else t.count end,
		dislike_count = case when t.dc is null then 0 else t.dc end,
		statistics_modified_at=getutc()
		from 
			(	
				select 
				sum(1) filter (where is_like=true) as count,
				sum(1) filter (where is_like=false) as dc
				from user_chapter_data
				where chapter_id=${props.id}
			) as t
		where id = ${props.id}
		returning like_count,dislike_count
	`;
	return res[0];
}
export async function updateArtwork(props: props) {
	// update review like,dislike
	const res = await props.sql`
		update artworks 
		set like_count = case when t.count is null then 0 else t.count end,
		dislike_count = case when t.dc is null then 0 else t.dc end,
		statistics_modified_at=getutc()
		from 
			(	
				select 
				sum(1) filter (where is_like=true) as count,
				sum(1) filter (where is_like=false) as dc
				from user_artwork_data
				where artwork_id=${props.id}
			) as t
		where artwork_id = ${props.id}
		returning like_count,dislike_count
	`;
	return res[0];
}
export async function updateComment(props: props) {
	// update comment dislike like,
	const res = await props.sql`
			update comments set like_count=coalesce(total.a,0) , dislike_count=coalesce(total.b  ,0), statistics_modified_at=(now() at time zone 'utc')
            from (select count(is_like) filter (where is_like=true) AS a, count(is_like) filter (where is_like=false) AS b  from user_comment_data where comment_id=${props.id}) as total
            where id=${props.id} and total.b is not null
			returning like_count,dislike_count
			;
`;
	return res[0];
}
export async function updateProfiles() {
	// update comment dislike like,
}
function get_do_name(query: { id: string | number; table: table_names }) {
	const do_name = query.id + '[' + query.table + ']';
	return do_name;
}
const inputSchema = object({
	table: AraryOne(['reviews', 'chapters', 'comments', 'artworks']),
	id: union([string(), number()]),
	like_count: number(),
	dislike_count: number(),
	stats: object({ like_count: number(), dislike_count: number() }),
	secret: string(),
	httpCall: string()
});

// ask DO to update count
export async function updateDOStats({
	id,
	table,
	do_statsCounter,
	prev_is_like,
	curr_is_like
}: {
	prev_is_like: boolean | null;
	curr_is_like: boolean | null | undefined;
	id: any;
	table: table_names;
	do_statsCounter: DurableObjectNamespace;
}) {
	console.log('calling DO update');
	if (prev_is_like === curr_is_like || curr_is_like === undefined) {
		console.log('no need update like count');
		return;
	}
	const params = {
		table: table,
		id: id,
		httpCall: new URL('/rest/api/stats/protected/refresh', SITE_URL).toJSON(),
		stats: {
			like_count: 0,
			dislike_count: 0
		},
		secret: STATS_COUNTER_API_SECRET_TOKEN,
		mode: 'GET'
	} satisfies globalThrottleIntervalInput;
	if (params.table === 'books') {
		params.stats.shelved_count = 0;
	}
	if (prev_is_like !== curr_is_like) {
		console.log('update user likes');
		if (prev_is_like === false && curr_is_like !== false) {
			params.stats.dislike_count -= 1;
		}
		if (curr_is_like === false && prev_is_like !== false) {
			params.stats.dislike_count += 1;
		}
		if (prev_is_like == true && curr_is_like !== true) {
			params.stats.like_count -= 1;
		}
		if (curr_is_like === true && prev_is_like !== true) {
			params.stats.like_count += 1;
		}
	}
	console.log('about to send decparams', params);
	const do_name = get_do_name({ id, table });
	const id1 = do_statsCounter.idFromName(do_name);
	if (!id1) throw new Error('missing id,cannot create do stub');
	const stub = do_statsCounter.get(id1);
	const r = await stub?.fetch(
		'https://www.update_stats_' + params.table + '.com',
		{
			method: 'POST',
			body: JSON.stringify(params)
		}
	);
	console.log('updated stats', r.status);
}
export const statisticApp = new Hono<apiEnv>().post(
	'/refresh',
	zValidator('json', inputSchema),
	async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
		// two choice, fetch from postgres  or fetch form DO store
		const query = req.valid('json');
		if (query.secret !== STATS_COUNTER_API_SECRET_TOKEN) {
			return json('Forbidden', 403);
		}
		let do_name = DO_GEN.UPDATE_LIKE_DISLIKE_FROM_DB({
			table: query.table,
			id: query.id
		});
		const throttler =
			requestHandler.platform?.env.do_throttler.idFromName(do_name);
		if (!throttler) {
			console.log('failed to find id for throttler');
			return new Response('Server Error', { status: 500 });
		}
		const stub = requestHandler.platform?.env.do_throttler.get(throttler);
		const res = await stub?.fetch(req.url);
		const val = (await res?.json()) as globalThrottleInterval;
		const prev_date = val['24hour'][1];
		const api_config: null | KV_API_CONFIG =
			await requestHandler.platform.env.kv_cache.get(
				KV.DB_API_CONFIG(),
				'json'
			);
		console.log('config', api_config);
		const should_run =
			api_config?.should_fetch_like_stats_from_db ||
			isBefore(prev_date, Date.now() - val['24hour'][0]);
		console.log(
			'in syn stats count',
			should_run,
			prev_date - Date.now(),
			query
		);
		const params: statsCounter['stored'] = {
			table: query.table,
			id: query.id,
			httpCall: '',
			stats: {
				like_count: query.like_count ?? 0,
				dislike_count: query.dislike_count ?? 0
			},
			secret: '',
			mode: 'SET',
			oldStats: query.stats
		};
		// now update DO with actual count
		const id = requestHandler.platform?.env.do_statsCounter.idFromName(
			get_do_name({ id: query.id, table: query.table })
		);
		if (!id) return json('unable to get id from name in handling DO update');
		const stub_counter = requestHandler.platform?.env.do_statsCounter.get(id);
		if (!id) return json('missing stub id');
		let store;
		if (should_run) {
			//FIXME revert this
			console.log('should call db to fetch latest count!');
			const sql = requestHandler.locals.sql();
			if (query.table == 'chapters') {
				store = await updateChapter({
					id: query.id,
					sql: sql
				});
			}
			if (query.table == 'comments') {
				store = await updateComment({
					id: query.id,
					sql: sql
				});
			}
			if (query.table == 'reviews') {
				store = await updateReview({
					id: query.id,
					sql: sql
				});
			}
			if (query.table == 'artworks') {
				store = await updateArtwork({
					id: query.id,
					sql: sql
				});
			}
			console.log('db stats', store, id);
			if (store) {
				params.stats.like_count = store.like_count - query.stats.like_count;
				params.stats.dislike_count =
					store.dislike_count - query.stats.dislike_count;
				const syncDO = await stub_counter?.fetch(req.url, {
					method: 'PATCH',
					body: JSON.stringify(params)
				});
				if (syncDO?.status !== 200) {
					console.error(
						'failed to sync like count to DO',
						await syncDO?.text()
					);
				}
				console.log('synced');
			} else {
				console.log('not able to find row');
			}
		} else {
			/* 	const data = await stub_counter?.fetch(req.url);
				const info = await data?.json(); */
			console.log(
				'should call durable to fetch current/estimated count!',
				query.stats
			);

			if (query.table == 'chapters') {
				console.log(' chapters stats update from DO');
				await requestHandler.locals.sql()`
						update chapters set like_count=${query.like_count},dislike_count=${query.dislike_count} 
						where id = ${query.id}
					`;
			} else if (query.table == 'comments') {
				console.log(' comments stats update from DO');
				await requestHandler.locals.sql()`
					update comments set like_count=${query.like_count},dislike_count=${query.dislike_count} 
					where id = ${query.id}
				`;
			} else if (query.table == 'reviews') {
				console.log(' reviews stats update from DO');
				await requestHandler.locals.sql()`
					update reviews set like_count=${query.like_count},dislike_count=${query.dislike_count} 
					where id = ${query.id}
				`;
			} else if (query.table == 'artworks') {
				console.log(' artworks stats update from DO');
				await requestHandler.locals.sql()`
					update artworks set like_count=${query.like_count},dislike_count=${query.dislike_count} 
					where artwork_id = ${query.id}
				`;
			}
		}
		return new Response('updated');
	}
);

export const statFreshApp = new Hono().route('/protected', statisticApp);
