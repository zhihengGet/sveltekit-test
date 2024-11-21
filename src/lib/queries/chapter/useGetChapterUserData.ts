import { createQuery } from '@tanstack/svelte-query';
import { getLocalUser, queryKey } from '..';
import { client } from '../api';
import { responseUnwrap } from '../util';

//type props = { chapter_id: number };
async function g(props: number) {
	const uid = await getLocalUser();
	const data = await client.rest.api.chapters.protected.user_data.$get({
		query: {
			chapter_id: props
		}
	});
	return responseUnwrap(data);
}

function useGetUserChapterData(props: () => number) {
	return createQuery(() => ({
		queryKey: queryKey.getUserChapterData(props()),
		queryFn: () => g(props())
		///	enabled: typeof props() !== 'undefined'
	}));
}
export { useGetUserChapterData };
