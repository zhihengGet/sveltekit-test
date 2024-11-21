import { actionToStatus } from '$lib/data/dbConstants';
import { queryKey } from '$lib/queries/constants';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { min_chapter } from '$lib/types';
type props = {
	action: 'publish' | 'draft' | 'trash';
	chapterID: number;
};

export async function chapterAction({ action, chapterID }: props) {
	const status = actionToStatus[action];

	const info = await supabase
		.from('chapters')
		.update({ status, user_modified_at: new Date().toUTCString() })
		.eq('id', chapterID)
		.select('book_id')
		.single();

	console.log(action + ' chapters', info);
	if (info.error) throw info.error;

	return info.data;
}

export function useChapterAction() {
	const queryClient = useQueryClient();
	return createMutation(() => { return {
		mutationFn: chapterAction,
		onSuccess: (data) => {
			console.log('updating old cahce ', data);
		}
	} });
}
