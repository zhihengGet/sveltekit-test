/* eslint-disable prefer-const */
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import type { book } from '$lib/types';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { bookCols, bookSelectFields, getLocalUser, queryKey } from '..';
import { PROHIBITED_BOOK_TITLE } from '$lib/data/constants';
import { client } from '../api';
import { responseUnwrap } from '../util';
//TODO price check
export async function isDeletable(bookId: Pick<book, 'id'>) {
	const id = (await getLocalUser()).id;
	const { error, count } = await supabase
		.from('chapters')
		.select('*', { head: true, count: 'exact' })
		.eq('book_id', bookId.id)
		.eq('author_id', id)
		.eq('status', 'published')
		.gt('price', 0);
	console.log('is book deletable ?', count);
	if (error || count === null) throw error;
	return count;
}

export function usePremiumChapterCount(bookId: Pick<book, 'id'>) {
	return createQuery(() => ({
		queryFn: () => isDeletable(bookId),
		queryKey: ['is deletable', bookId],
		enabled: !!bookId.id
	}));
}
// not used, we dont delete books
export async function toggleHidden(book: book & { newTitle?: string }) {
	console.log('delete book ', book);
	//props.user_id = "3fc92b8c-0fc0-4053-844e-cf72cfebad10";
	const id = (await getLocalUser()).id;

	let temp = book.is_visible
		? {
				title: renameBookTitle(book.title)
			}
		: {};
	if (book.newTitle) {
		temp.title = book.newTitle;
	}
	const data = await client.rest.api.books.protected.hide_book.$post({
		json: {
			book_id: book.id,
			is_visible: !book.is_visible,
			...temp
		}
	});

	return responseUnwrap(data);
}
export function renameBookTitle(title: string) {
	return title + PROHIBITED_BOOK_TITLE[0] + Date.now();
}
export function useToggleHidenBook() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: toggleHidden,
		onSuccess: (book: book) => {
			client.setQueriesData<book[]>(
				{ queryKey: queryKey.getAuthoredBooks() },
				(old) => {
					if (old) {
						return old.map((v) => {
							if (v.id === book.id) {
								v.is_visible = false;
							}
							return v;
						});
					}
					return old;
				}
			);
		},
		meta: {
			toast: true
		}
	} });
}
