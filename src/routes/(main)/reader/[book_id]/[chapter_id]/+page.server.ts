import { error, json, redirect } from '@sveltejs/kit';
import type { PageLoad, PageServerLoad } from './$types';
import type { book, chapter, chapterWithUserInfo } from '$lib/types';
import { IsomorphicSanitizer } from '$lib/utils';
import { getPublicBookCoverUrlSync } from '$lib/queries/storage/ObjectKey';
import { getPreviewSessionIdAsync } from '$lib/queries/preview/usePreview';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { format, isBefore } from 'date-fns';
import {
	chapterCols,
	user_chapter_data_fields
} from '$lib/queries/chapter/fields';
import { extractFeature } from '$lib/cf/geoloation';
import { verifyPreviewId } from '../../../../(api)/rest/previewApp.server';
import { isBookPermitted } from '../../../../(api)/rest/bookApp.server';

// use service role
export const load = (async ({
	params,
	locals: { supabase, user },
	platform,
	request,
	url
}) => {
	/* const chapterCache: chapter | null = await platform!.env.KV_CHAPTER.get(
		params.chapter_id,
		'json'
	); */
	const cid = params.chapter_id;
	//console.log('params', params);
	//	if (typeof cid !== 'number') error(404, { message: 'Invalid Chapter id' });

	const view = await getPreviewSessionIdAsync(url.toString());
	const cacheKey = new Request(request.url + '?api');
	const cache = await platform?.caches.default.match(cacheKey);
	type res = { chapter: chapterWithUserInfo; book_cover: string; book: book };
	if (cache && !view.id) {
		// only return cached result
		const data = await cache.json();
		console.log('cached ', JSON.stringify(data), typeof cache);
		return data as res;
	}

	console.log('Chapter not cached');

	// only check if there is no preview url
	let b = await isBookPermitted({
		...params,
		user_id: user?.id,
		book_id: params.book_id,
		kv_cache: platform!.env.kv_cache,
		preview_id: view.id
	});
	// we fetch the book using admin supabase client due to preview URL
	const chapter = await supabaseServer()
		.from('chapters')
		.select(`${chapterCols},user_chapter_data(${user_chapter_data_fields})`)
		.eq('id', params.chapter_id)
		.eq(
			'user_chapter_data.user_id',
			user?.id ?? '11111111-1111-1111-1111-fd729d221b7a'
		)
		.single();

	if (chapter.error) {
		console.log('chapter does not exists', chapter.error);
		if (chapter.error.code === 'PGRST116') {
			return error(404, 'Chapter Does Not Exists');
		}
		error(404, chapter.error);
	}
	if (
		chapter.data.status !== 'published' &&
		chapter.data.author_id !== user?.id
	) {
		if (!view.id) error(401, { message: 'Not Authorized' });
		await verifyPreviewId({ ...params, preview_id: view.id });
		const feat = extractFeature.fetch(request);
		// clicks, country,device/browser on preview key level
		platform?.env.PREVIEW_LINKS?.writeDataPoint({
			indexes: [view.id],
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
	// write to worker analytics
	// view by country
	// view by time
	// beta reader per preview url
	// beta reader who made review per preview url(includes review link ?)

	async function updateUserHistory() {
		if (user) {
			const r = await supabase.from('user_book_data').upsert(
				{
					last_chapter_read: cid,
					book_id: params.book_id,
					user_id: user.id,
					author_folder: ''
				},
				{
					onConflict: 'book_id,user_id',
					ignoreDuplicates: false
				}
			);
			console.log('updating user last chapter read', r);
		}
	}
	//TODO check if book is public
	//const book = await supabase.from("books")
	const book_cover = getPublicBookCoverUrlSync({
		book_id: chapter.data.book_id,
		user_id: chapter.data.author_id
	});
	//chapter.data.content = await IsomorphicSanitizer(chapter.data?.content ?? '');
	const res = {
		chapter: chapter.data as chapterWithUserInfo,
		book_cover,
		book: b
	};
	async function put() {
		//console.log('putting into cache');
		// Must use Response constructor to inherit all of response's fields
		let response = new Response(JSON.stringify(res));

		// Cache API respects Cache-Control headers. Setting s-max-age to 10
		// will limit the response to be in cache for 10 seconds max
		// Any changes made to the response here will be reflected in the cached value
		response.headers.append('Cache-Control', 's-maxage=10,public');
		await platform?.caches.default.put(cacheKey, response);
	}
	if (!view.id) platform?.context.waitUntil(put()); // only cache published chapter NOT preview chapters
	platform?.context.waitUntil(updateUserHistory()); // only cache published chapter NOT preview chapters
	return res;
}) satisfies PageServerLoad;
