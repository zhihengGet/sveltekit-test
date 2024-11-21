import type { book, chapter, min_chapter } from '$lib/types';

import { CommonWords } from './ink/[book_id]/freq';
import { merge } from 'lodash-es';

type InkType = {
	chapter: chapter | null;
	chapterList: min_chapter[];
	openChapterSheet: boolean;
	openCreateDialog: boolean;
	book: book;
	bulkUpload: boolean;
	openAutocomplete: boolean;
	enableAutocomplete: boolean;
	mode: 'focus' | 'everyday';
	focus: boolean;
	preview: {
		open: boolean;
	};
};
const init: InkType = {
	chapter: null,
	//chapterList: [],
	book: null, // will never be null
	openChapterSheet: true,
	openCreateDialog: false,
	bulkUpload: false,
	openAutocomplete: false,
	enableAutocomplete: false,
	focus: false,
	mode: 'everyday',
	preview: {
		open: false
	}
};

type InkStoreUi = {
	focus: boolean;
};
const ui: InkStoreUi = {
	focus: false
};
export const InkStore = $state<InkType>(init);

export const WordBank = $state([...CommonWords]);
export const autoCompleteStore = $state<
	{
		keyword: string;
		defination: string;
	}[]
>([]);
export const InkStoreFocus = $state<InkStoreUi>(ui);
export function updateInkState(InkType: Partial<InkType>) {
	merge(InkStore, InkType);
}
