import type { ChapterFieldsNoContent } from '$lib/queries/chapter/fields';
import type { book, chapter, min_chapter } from '$lib/types';

export const profileStore: {
	selectedBook: book | null;
	selectedChapter: min_chapter | null;
	imageName: string;
	description: string;
	ai: boolean;
} = $state({
	selectedBook: null,
	selectedChapter: null,
	imageName: '',
	description: '',
	ai: false
});
