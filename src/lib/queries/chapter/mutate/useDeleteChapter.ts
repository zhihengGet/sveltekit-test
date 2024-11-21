import { getUID } from '$lib/queries/user';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { queryKey } from '$lib/queries/constants';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { min_chapter } from '$lib/types';

export async function deleteChapter(data: min_chapter) {
	console.log('delete chapter ', data);

	const userid = await getUID();

	// const cleaned = pickBy(temp, (val) => val !== undefined);

	// supabase auto filter undefined?
	//TODO do the filter ourselves
	const info = await supabase
		.from('chapters')
		.delete()
		.match({ id: data.id, author_id: userid });

	if (info.error) throw info.error;

	console.log('deleted !', info.data);
	return data;
}

export function useDeleteChapter() {
	const queryClient = useQueryClient();

	return createMutation<min_chapter, PostgrestError, min_chapter>({
		mutationFn: deleteChapter,
		onSuccess: async (data) => {}
	});
}
