import type { artwork, paginateQuery } from '$lib/types';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { queryKey } from '../constants';
import { responseUnwrap } from '../util';
import { uploadImage } from './useUpload';

async function deleteArtwork({ artwork_id }: Pick<artwork, 'artwork_id'>) {
	// delete from r2
	if (!artwork_id) {
		throw new CustomError('missing artwork id');
	}
	const deleter = client.rest.api.upload.protected.artwork.$delete;

	const res = await deleter({ json: { artwork_id } });

	if (res.status !== 200) {
		throw new CustomError(
			(await res.json())?.message ?? 'Failed to delete artwork'
		);
	}
}

async function createArtwork(
	props: { file: File } & Pick<
		artwork,
		'name' | 'book_id' | 'chapter_id' | 'description' | 'ai'
	>
) {
	const data = await uploadImage(props);
	return data;
}
export function useGetArtworks(props: () => paginateQuery<artwork>) {
	return createQuery(() => ({
		queryFn: async () => {
			const post = client.rest.api.artworks.getArtworks.$post;
			const data = await post({ json: props() });
			return responseUnwrap(data);
		},
		queryKey: queryKey.getArtwork(props())
		//	enabled: user.authStatus === 'signed in'
	}));
}
export function useDeleteArtwork() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: deleteArtwork,
		onSuccess: () => {
			client.invalidateQueries({
				predicate: (s) => {
					return s.queryKey.includes(queryKey.getArtwork({})[0]);
				}
			});
		},
		meta: { toast: true }
	} });
}

export function useCreateArtwork() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: createArtwork,
		onSuccess: (data) => {
			client.invalidateQueries({
				predicate: (s) => {
					return s.queryKey.includes(queryKey.getArtwork({})[0]);
				}
			});
		},
		meta: { toast: true }
	} });
}

/* async function c() {
	const uid = await getUserIDFromLocalStorage();
	const data = await supabase
		.from('artworks')
		.select('*', { head: true, count: 'exact' })
		.eq('user_id', uid);
	return data.count;
}
export function useGetArtworksCount() {
	return createQuery(() => {
		return {
			queryKey: ['artworks', 'count', 'self'],
			queryFn: c
		};
	});
} */
export function useEndorseArtwork() {
	const query = useQueryClient();
	return createMutation(() => { return {
		mutationFn: async ({
			artwork_id,
			endorsed
		}: {
			artwork_id: string;
			endorsed: boolean;
		}) => {
			await responseUnwrap(
				await client.rest.api.artworks.protected.endorse.$post({
					json: { artwork_id: artwork_id, endorsed: endorsed }
				})
			);
			return {
				artwork_id
			};
		},
		onSuccess: (data) => {
			query.setQueriesData(
				{
					predicate: (s) => {
						return s.queryKey.includes(queryKey.getArtwork({})[0]);
					}
				},
				(v) => {
					if (Array.isArray(v)) {
						for (let x of v) {
							if (x.artwork_id === data.artwork_id) {
								x.endorsed = !x.endorsed;
							}
						}
						return JSON.parse(JSON.stringify(v));
					}
					return v;
					/* 	v.endorsed = data.endorsed;
					return JSON.parse(JSON.stringify(v)); */
				}
			);
		},
		meta: { toast: true }
	} });
}
