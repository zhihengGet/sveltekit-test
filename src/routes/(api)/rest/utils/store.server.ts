import { bookCols } from '$lib/queries';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { book } from '$lib/types';

export async function cacheRequests(event) {
	event.locals.cf = {};
}

const request = (book_id) =>
	new Request('https://www.cache.com?book_id=' + book_id);

type props = {
	platform: App.Platform;
	book_id: number;
};
export async function getCachedBook(props: props) {
	const data = await props.platform.caches.default.match(
		request(props.book_id)
	);
	if (data) {
		return data.json() as Promise<book>;
	}
	const book = await supabaseServer()
		.from('books')
		.select(bookCols)
		.eq('id', props.book_id)
		.single();

	// Must use Response constructor to inherit all of response's fields
	let response = new Response(JSON.stringify(book));
	// Any changes made to the response here will be reflected in the cached value
	response.headers.append('Cache-Control', 's-maxage=10');
	await props.platform.caches.default.put(request(props.book_id), response);
	return book;
}
export async function purgeCachedBook(props: props) {
	await props.platform.caches.default.delete(request(props.book_id));
}
