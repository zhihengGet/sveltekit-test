import { get, writable } from 'svelte/store';
import type { book, previews } from '$lib/types';

export const dashboardBookStore = $state<{
	selectedBook: book | null;
	openAddFolderDialog: boolean;
	openCreateBook: boolean;
	selectedPreview: previews | null;
}>({
	selectedBook: null,
	openAddFolderDialog: false,
	openCreateBook: false,
	selectedPreview: null
});
/* export const BookStore = writable<{ selectedBook: book | null }>({
	selectedBook: null
});
 */
export function selectEditBook(book: book) {
	dashboardBookStore.selectedBook = book;
}
