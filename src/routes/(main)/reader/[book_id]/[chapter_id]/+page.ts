import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { chapter } from '$lib/types';
import { browser } from '$app/environment';
import { headerControl } from '$lib/state/ui.svelte';
import { toggleTheme } from '$components/ThemeToggle.svelte';
import { IsomorphicSanitizer } from '$lib/utils';
import { chapterMetaStore } from './store.svelte';

// use service role
export const load = (async ({ params, parent, data }) => {
	headerControl.toggle();
	chapterMetaStore.current_chapter = data.chapter;
	// load theme from server side
	if (browser) toggleTheme(true);
	//const info = await parent(); // wait for parent to set supabase client
	const chapter = data.chapter;

	//let user_book_data: user_chapter_data;
	//if(info.session)
	//user_book_data= await info.supabase.from("user_chapter_data").select()
	//console.log('🚀 ~ file: +page.ts:11 ~ load ~ chapter:', chapter);
	/* 	if (chapter.error) {
		error(400, chapter.error);
	}
	chapter.data.content = await IsomorphicSanitizer(chapter.data?.content ?? '');
	if (chapter.data.id == null) error(401, 'Unable to find this chapter'); */
	/* 	if (browser) {
		data.chapter.content = IsomorphicSanitizer(data.chapter.content);
	} */
	return { chapter: chapter, book_cover: data.book_cover, book: data.book };
}) satisfies PageLoad;
