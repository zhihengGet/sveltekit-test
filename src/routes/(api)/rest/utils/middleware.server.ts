import { createMiddleware } from 'hono/factory';
import type { apiEnv } from '../[...paths]/+server';
import type { book } from '$lib/types';
import { getAlarmScheduleFnStub, getBookAlarmScheduleFnStub } from './alarm';
import typesense from 'typesense';
import { isValid } from 'date-fns';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import {
	BOOK_STATS_API_API_SECRET_TOKEN,
	TYPESENSE_APIKEY,
	TYPESENSE_HOST,
	TYPESENSE_PORT,
	TYPESENSE_PROTO
} from '$env/static/private';
import { HOUR, SITE_URL } from '$lib/data/constants';
import { DisposeRPC } from './chat';
import { cloneDeep } from 'lodash-es';

export async function syncToSearchEngine({
	book_id,
	book
}: {
	book_id: book['id'];
	book?: book;
}) {
	const res = !book
		? await supabaseServer()
				.from('books')
				.select('*')
				.eq('id', book_id)
				.single()
		: { data: book, error: null };

	if (res.error || !res.data) {
		return console.error('failed to sync to search engine', res.error);
	}
	let bk = cloneDeep(res.data);
	console.log('convert date to number');
	for (let x in bk) {
		let k = x as keyof book;
		if (
			typeof bk[k] == 'string' &&
			bk[k].length > 10 &&
			bk[k].includes('-') &&
			isValid(new Date(bk[k]))
		) {
			// convert all date to num
			bk[k] = new Date(bk[k]).getTime();
		}
		if (k == 'display_name') {
			bk[k] = bk[k] ?? bk['author_name'];
		}
	}

	let r = await getSearchClient()
		.collections('books')
		.documents()
		.import([bk], { action: 'upsert' });
	console.log('sync to typesense res ', book_id, r);
}

export function getSearchClient({ timeout }: { timeout?: number } = {}) {
	return new typesense.Client({
		nodes: [
			{
				host: TYPESENSE_HOST, // For Typesense Cloud use xxx.a1.typesense.net
				port: TYPESENSE_PORT, // For Typesense Cloud use 443
				protocol: TYPESENSE_PROTO // For Typesense Cloud use https
			}
		],
		apiKey: TYPESENSE_APIKEY,
		connectionTimeoutSeconds: timeout ? timeout : 60
	});
}

export async function scheduleBookStatsUpdate({
	book_id,
	requestHandler
}: {
	book_id: book['id'];
	requestHandler: {
		platform: apiEnv['Variables']['requestHandler']['platform'];
	};
}) {
	console.log('schedule books stats update');
	const stub = getBookAlarmScheduleFnStub({
		name_arg: { type: 'book_stats_update', unique_id: book_id },
		requestHandler
	});
	const data = await stub.scheduleStatsUpdate({
		time: HOUR,
		httpCalls: {
			body: JSON.stringify({
				id: book_id,
				secret: BOOK_STATS_API_API_SECRET_TOKEN
			}),
			link: SITE_URL + 'rest/api/books/stats/book',
			retry: 2,
			method: 'post'
		}
	});
	await DisposeRPC(data);
	console.log('Scheduled books stats update', data);
}

/* book sync to search engine middleware for books */
export const bookSync = createMiddleware<apiEnv>(async (c, next) => {
	await next();
	// update search engine
	if (c.req.method.toLowerCase() !== 'get') {
		let routes = ['/update_book', '/create_book', '/hide_book'];
		if (routes.some((v) => c.req.routePath.includes(v))) {
			let r = c.res;
			if (r.status == 200) {
				console.log('%c Oh my heavens! ', 'background: #222; color: #bada55');
				let book: book = await r.json();
				await syncToSearchEngine({ book, book_id: book.id })
					.catch((e) => {
						console.error('error sync data to typesense', e);
					})
					.then((v) => {
						return console.log('finished sync typesense', v, book.id);
					});
				c.res = c.json(book);
			}
		}
	}
});
