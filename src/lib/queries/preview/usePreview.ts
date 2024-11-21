import type { paginateQuery, previews } from '$lib/types';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { serializeFilter } from '$lib/state';
import { previewQuerySchemaGet } from '$lib/schema/querySchema/previewSchema';
import { GET_URL, SITE_URL } from '$lib/data/constants';
import { add, isBefore } from 'date-fns';
import localforage from 'localforage';
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import { string } from 'zod';
import { page } from '$app/stores';
import { afterNavigate, onNavigate } from '$app/navigation';
import { queryKey } from '../constants';

const post = client.rest.api.previews.protected.create.$post;
async function createPreview(props: Parameters<typeof post>[0]['json']) {
	//parse(previewQuerySchemaGet, props);
	const res = await client.rest.api.previews.protected.create.$post({
		json: props
	});
	if (res.status !== 200) {
		const r = await res.json();
		throw new CustomError(r?.message ?? 'Error when creating preview');
	}
	return res.json();
}
async function getPreview(props: paginateQuery<previews>) {
	//let data = { payload: serializeFilter(props) };
	const res = await client.rest.api.previews.protected.list.$post({
		json: props
	});
	const r = await res.json();
	if (res.status !== 200 || 'message' in r) {
		throw new CustomError(r?.message ?? 'Error when getting previews');
	}
	return r;
}
async function deletePreview(props: Partial<previews>) {
	const res = await client.rest.api.previews.protected.delete.$delete({
		json: props
	});
	if (res.status !== 200) {
		const r = await res.json();
		//@ts-ignore
		throw new CustomError(r?.message ?? 'Error when deleting preview');
	}
	return true;
}
export function useCreatePreview() {
	const client = useQueryClient();
	return createMutation(() => {
		return {
			mutationKey: ['previews', 'create'],
			mutationFn: createPreview,
			onSuccess: (data) => {
				client.invalidateQueries({ queryKey: ['previews'] });
			},
			meta: { toast: true }
		};
	});
}
/* export function useGetPreview(props: Partial<previews>) {
	return createQuery({
		queryKey: ['previews', 'list', props],
		queryFn: () => getPreview(props)
	});
} */
export function useGetPreviews(props: () => paginateQuery<previews>) {
	return createQuery(() => ({
		queryKey: ['previews', 'list', props()],
		queryFn: () => getPreview(props())
	}));
}
export function useDeletePreview() {
	const client = useQueryClient();
	return createMutation(() => {
		return {
			mutationKey: ['previews', 'delete'],
			mutationFn: deletePreview,
			meta: { toast: true },
			onSuccess: () => {
				client.invalidateQueries({ queryKey: ['previews'] });
			}
		};
	});
}
const PREVIEW_QUERY_KEY = 'preview_session_id';
const QUERY_STRING_KEY = 'preview_session_id';
// generate book or reader view url from ids
export function generateViewURL(props: {
	book_id: number | string;
	chapter_id?: string | number | null;
}) {
	if (!props.chapter_id) {
		const temp = new URL(`/book/${props.book_id}`, SITE_URL);
		return temp;
	}
	const url = new URL(
		'/reader/' + props.book_id + '/' + props.chapter_id,
		SITE_URL
	);
	return url;
}
export function generatePreviewURL(
	props: Pick<previews, 'book_id' | 'chapter_id' | 'id'>
) {
	let preview_id = browser
		? new URL(window.location.href).searchParams.get(PREVIEW_QUERY_KEY)
		: '';

	props.id = props.id ?? preview_id;
	console.log('preview id', preview_id);
	let is_uuid = string()
		.uuid()
		.safeParse(props.id ?? preview_id);
	if (!props.chapter_id) {
		const temp = new URL(`/book/${props.book_id}`, SITE_URL);
		//temp.searchParams.set('is_all', 'true');
		if (is_uuid.success) temp.searchParams.set(PREVIEW_QUERY_KEY, props.id);
		return temp.href;
	}
	const url = new URL(
		'/reader/' + props.book_id + '/' + props.chapter_id,
		SITE_URL
	);
	if (is_uuid.success) url.searchParams.set(PREVIEW_QUERY_KEY, props.id);
	//url.searchParams.set('is_all', 'false');
	return url.toString();
}
export function useUnloadURLParams() {
	const tan = useQueryClient();
	afterNavigate(() => {
		console.log('page loaded');
		return page.subscribe(async (v) => {
			const url = v.url.searchParams;
			console.log('page url loader', url.entries());
			const item = await localforage.getItem(PREVIEW_QUERY_KEY);
			const id = url.get(PREVIEW_QUERY_KEY);
			if (id && item !== id) {
				//first time getting this id
				//disable chapter list caching
				tan.invalidateQueries({
					queryKey: queryKey.getPublicChapters('').slice(0, 2)
				});
			}
			localforage.setItem(PREVIEW_QUERY_KEY, url.get(PREVIEW_QUERY_KEY));
		});
	});
}
export function useLoadURLParam<T>(cacheURL: URL): T {
	const tempURL =
		(cacheURL ?? browser)
			? new URL(window.location.href)
			: new URL('https://example.com');
	const check = tempURL.searchParams.entries();
	let url = $state(Object.fromEntries(check));
	onMount(async () => {
		const item = await localforage.getItem(PREVIEW_QUERY_KEY);
		Object.assign(url, item);
	});
	return url;
}
/**
 * @deprecated use getSessionAsync
 * @returns
 */
export function getSessionId(props: URL) {
	return {
		id: props.searchParams.get(PREVIEW_QUERY_KEY) ?? '',
		is_all: props.searchParams.get('is_all') === 'true'
	};
}
export async function getPreviewSessionIdAsync(href?: string) {
	const url = browser
		? new URL(href ?? window.location.href)
		: new URL(href ?? 'https://www.google.com');

	let local_id = browser
		? (((await localforage.getItem(PREVIEW_QUERY_KEY)) as string) ??
			url.searchParams.get(PREVIEW_QUERY_KEY))
		: url.searchParams.get(PREVIEW_QUERY_KEY);

	let id = local_id || url.searchParams.get(PREVIEW_QUERY_KEY);
	if (string().uuid().safeParse(id).success) {
		return { id };
	}
	return {
		id: undefined
	};
}

/**
 *
 * @param ttl hour
 * @returns
 */
export function isExpired({
	createdAt,
	ttl
}: {
	createdAt: number | Date;
	ttl: number;
}) {
	return isBefore(
		new Date(createdAt).getTime() + ttl * 60 * 60 * 1000,
		new Date()
	);
}
