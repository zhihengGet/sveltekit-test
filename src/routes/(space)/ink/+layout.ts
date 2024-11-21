import { getBook } from '$lib/queries';
import type { min_chapter } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from '../$types';
import { updateInkState } from '../store.svelte';
export const ssr = false;
export const csr = true;
export const load: LayoutLoad = async ({ params, parent }) => {
	const data = await parent(); // wait for authentication
	console.log('layout ink space --- ', params.book_id, data.profile);
	if (!data.profile?.id || !params.book_id)
		error(400, { message: 'Are you logged in?' });
	const book = await getBook({
		id: params.book_id
	});
	//console.log(book);
	let chapters: min_chapter[] = [];

	if (!book || book.author_id != data.profile.id) {
		error(400, { message: 'book does not exists ' });
	}

	updateInkState({
		book: book,
		chapterList: chapters
	});

	return { book };
};
