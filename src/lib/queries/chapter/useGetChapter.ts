import { createQuery as useQuery } from '@tanstack/svelte-query';

import { queryKey } from '$lib/queries/constants';
import type { chapter } from '$lib/types';
import { IsomorphicSanitizer } from '$lib/utils/sanitize';
import { client } from '../api';
import { getPreviewSessionIdAsync } from '../preview/usePreview';
import { responseUnwrap } from '../util';

type props = Partial<chapter>;
// used to infinite scroll fetching
export async function getChapter(data: props) {
	const info = await client.rest.api.chapters.chapter.$get({
		query: {
			...data,
			preview_id: (await getPreviewSessionIdAsync()).id
		}
	});
	console.log('get specific chapter', info, data);
	const res = await responseUnwrap(info);

	if (res && res.content) {
		const clean = await IsomorphicSanitizer(res?.content);
		res.content = clean;
	}
	return res;
}
//get public chapter content
export function useGetPublicSpecificChapter(init: chapter) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getSpecificChapter(init.id),
			queryFn: () => {
				return init;
			}, // dont need to fetch since init
			enabled: !!init,
			initialData: init
		};
	});
}
//get public chapter content
export function useGetPrivateSpecificChapter(props: () => props) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getSpecificChapter(props().id),
			queryFn: async () => {
				const data = await client.rest.api.chapters.protected.content.$get({
					query: { id: props().id }
				});
				return responseUnwrap(data);
			},
			enabled: !!props().id
		};
	});
}
