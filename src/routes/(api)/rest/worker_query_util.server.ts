import { ACCOUNT_ID, ANALYTICS_TOKEN } from '$env/static/private';
import { type Cache, CacheStorage } from '@cloudflare/workers-types';
/**
 * @deprecated don't use
 * @param props
 */
export function cacheRes(props: {
	cacheKey: any;
	data: object;
	cache: Cache;
	waitUntil: ExecutionContext['waitUntil'];
	maxAge: number;
}) {
	props.waitUntil(
		props.cache.put(
			props.cacheKey,
			//@ts-ignore
			new Response(JSON.stringify(props.data), {
				status: 200,
				headers: { 'cache-control': 's-max-age=' + props.maxAge }
			})
		)
	);
}

export async function queryAnalytics<T>(query: string): Promise<T> {
	//const query = 'SELECT * FROM my_dataset';
	const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`;
	const response = await fetch(API, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ANALYTICS_TOKEN}`
		},
		body: query
	});
	if (response.status !== 200) {
		console.error(
			'error with fetching analytics',
			query,
			await response.text()
		);
		throw new Error('Failed to fetch data from analytics');
	}
	return await response.json();
}
