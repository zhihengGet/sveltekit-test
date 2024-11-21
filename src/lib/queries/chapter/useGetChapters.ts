import { queryKey } from '$lib/queries/constants';
import { chapterSchemaGet } from '$lib/schema/querySchema/chapterSchema';
import { serializeFilter } from '$lib/state';
import type { book, chapter, min_chapter, paginateQuery } from '$lib/types';
import { createQuery as useQuery } from '@tanstack/svelte-query';
import { sortBy } from 'lodash-es';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { getPreviewSessionIdAsync } from '../preview/usePreview';
import { ResTypeNarrow, responseUnwrap } from '../util';

// pagination
export function useGetChaptersList(data: () => paginateQuery<chapter>) {
	return useQuery(() => ({
		queryKey: queryKey.getChapters(data()),
		queryFn: async () => {
			if (!data().filter.book_id)
				throw new CustomError('missing book id in chapter query');
			const payload = { payload: serializeFilter(data()) };
			const v = chapterSchemaGet.parse(payload);
			const r = await client.rest.api.chapters.pagination.$get({
				query: payload
			});
			const rr = await r.json();
			if (r.status !== 200) throw rr;
			if (ResTypeNarrow(rr)) return rr;
			throw rr;
		},
		enabled: () => !!data().filter.book_id,
		structuralSharing: false,
		staleTime: 1000 * 60 * 60 // 1hr stale time
	}));
}

export function useGetLastChapter(data: { book_id: number }) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getLastChapter(data),
			queryFn: async () => {
				if (!data.book_id)
					throw new CustomError('missing book id in chapter query');
				const r = await client.rest.api.chapters.getLastChapter.$get({
					query: { book_id: data.book_id + '' }
				});
				const rr = (await r.json()) as min_chapter;
				if (r.status !== 200) throw rr;
				return rr;
			},
			enabled: () => !!data.book_id,
			structuralSharing: false,
			staleTime: 1000 * 60 * 60 // 1hr stale time
		};
	});
}

/**
 * @description  public chapter list
 * @param prop
 * @returns
 */
export function useGetReactivePublicChapters(prop: () => number) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getPublicChapters(prop()),
			queryFn: async () => {
				const data = await client.rest.api.chapters.getChapterList.$get({
					query: {
						book_id: prop() + '',
						preview_id: (await getPreviewSessionIdAsync()).id
					}
				});
				return await responseUnwrap(data);
			},
			enabled: () => prop() != null,
			staleTime: 3600000
		};
	});
}

// all chapter list including draft
export function useGetAllChapters(prop: Pick<book, 'id'>) {
	return useQuery(() => ({
		queryKey: queryKey.getAllChapters(prop),
		queryFn: async () => {
			const data = await client.rest.api.chapters.protected.getChapterList.$get(
				{
					query: { book_id: prop!.id + '' }
				}
			);
			return responseUnwrap(data);
		},
		enabled: () => !!prop?.id,
		select: (data) => {
			const result = sortBy(data, (v) => {
				return v.sequence;
			});
			return result;
		}
	}));
}
// all chapter list including draft
export function useGetRecentChapters(args: () => { author_id: string }) {
	return useQuery(() => ({
		queryKey: queryKey.getRecentCreatedChapters(),
		queryFn: async () => {
			const data = await client.rest.api.chapters.recent_created_chapters[
				':author_id'
			].$get({
				param: {
					author_id: args().author_id
				}
			});
			return responseUnwrap(data);
		}
	}));
}
