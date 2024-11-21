import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { headerControl } from '$lib/state/ui.svelte';
import queryClient from '$lib/queries/client';
import { queryKey } from '$lib/queries';

export const load: PageLoad = async ({ params, data }) => {
	if (!data.author) return error(400, 'missing author ');
	headerControl.openBottomHeader = true;
	queryClient.setQueryData(
		queryKey.getPublicChapters(parseFloat(params.book_id)),
		() => {
			return data.book.chapters;
		}
	);
	return { book: data!.book, author_profile: data!.author };
};
