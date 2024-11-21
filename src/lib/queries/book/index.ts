import { formatNumber } from '$lib/utils';

export * from './createBook';
export * from './getBooks';
export * from './updateBook';
export * from './useGetShelvedBook';
export * from './fields';

export function getBookWordCount(
	book: {
		word_count: number | null;
		character_count: number | null;
		language: string;
	} | null
) {
	if (!book) {
		return ['Word Count', 0];
	}
	let isWord = book.language === 'English';
	return [
		isWord ? 'Word Count' : 'Char Count',
		isWord ? formatNumber(book.word_count) : formatNumber(book.character_count)
	];
}
