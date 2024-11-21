import type { readerTheme } from '$lib/data/filter/readerPersonalize';
import type { book, chapter, profile } from '$lib/types';
import { user } from './runes.svelte';
export type status =
	| 'signing in'
	| 'signing out'
	| 'signed in'
	| 'signed out'
	| 'anon'
	| 'verifying';

interface editorProps {
	selectedBook?: Partial<book[]> | null;
	selectedChapter?: Partial<chapter> | null;
	selectedBookID?: number;
	selectedChapterID?: number;
}
interface readerProps extends readerTheme {
	selectedSection?: HTMLElement;
	selectedSectionID?: string;
	openChapterList: boolean;
	openThemeSetting: boolean;
	showAllChapters: boolean;
}

export const initialUser: profile = {
	about_you: 'this person is a mystery',
	avatar_url: '',
	username: 'Just Visiting',
	created_at: new Date().toUTCString(),
	dislike_count: 0,
	id: '',
	language: 'world',
	like_count: 0,
	updated_at: new Date().toUTCString(),
	extra: null,
	birthday: null,
	industry: '',
	occupation: ''
};

export const getUserStoreValue = () => user;
