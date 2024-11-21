/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
// @ts-nocheck
import { book_status } from '$lib/data/dbConstants';
import { bookFilter, timeRangeMapper } from '$lib/data/filter';
import { paginateSchema } from '$lib/schema/paginate';
import type { book, paginateQuery } from '$lib/types';
import { parse, stringify } from '$lib/utils/serialize';
import localforage from 'localforage';
import { cloneDeep, isNumber, merge } from 'lodash-es';
import { onMount } from 'svelte';
import { DEFAULT_ANY_ALL_AGE_RANGE } from '$lib/data/constants';
/* 
 @description this runes is for front page filtering
*/
export type bookFilter = paginateQuery<book>;

const init: bookFilter = {
	paginate: {
		page: 1,
		asc: false,
		orderWith: 'like_count' as keyof book,
		orderWithMultiple: {},
		start: 0,
		end: 10,
		size: 12
	},
	filter: {
		tags: [],
		category: 'fiction',
		//updated_at: 'yesterday',
		user_modified_at: 'last 300 days',
		//created_at: 'last 300 days',
		status: book_status[1],
		language: 'English'
		//lead: bookFilter.string.lead[2],
		//age_range: DEFAULT_ANY_ALL_AGE_RANGE
		//average_rating: 50,
		//character_count: 0
	},
	search: { regex: '' },
	options: { shouldDebounce: true }
} satisfies paginateQuery<book>;
export const bookFilterStore = $state({ ...init });
const FRONT_PAGE = 'filter front page';
export function useGetSavedFilter(fn: (filter: bookFilter) => void) {
	onMount(async () => {
		console.log('on mount called');
		const prev = new URLSearchParams(window.location.search).get('filter');
		const prevObj = prev ? deserializeFilter(prev) : false;
		if (prevObj) fn(prevObj);

		// check local storage
		const filterLocal = await localforage.getItem(FRONT_PAGE);
		//@ts-ignore
		if (filterLocal) fn(filterLocal);
	});
}
export async function useGetFilter(): Promise<bookFilter | undefined> {
	const prev = new URLSearchParams(window.location.search).get('filter');
	const prevObj = prev ? deserializeFilter(prev) : false;
	const res = paginateSchema.safeParse(prevObj);
	console.log('url state filter', res);
	if (res.success) if (prevObj) return prevObj;
	// check local storage
	const filterLocal = await localforage.getItem(FRONT_PAGE);
	const ret = paginateSchema.safeParse(filterLocal);
	console.log('local storage filter', ret);
	//@ts-ignore
	if (ret.success) return filterLocal;

	console.log('failed to fetch valid schema for book filtering');
}

export const updateCategoryAndTags = (
	category: book['category'],
	tag: string
) => {
	let v = bookFilterStore;
	if (v.filter.category != category) {
		v.filter.category = category;
		v.filter.tags = [];
	}

	const i = v.filter.tags?.indexOf(tag);
	if (v.filter.tags && i !== undefined && i > -1) {
		console.log('toggle tags');
		v.filter.tags.splice(i, 1);
	} else {
		if (tag) v.filter.tags?.push(tag);
	}

	bookFilterStore.filter = { ...bookFilterStore.filter };
};
export const clearFilter = () => {
	//window.history.pushState(null, '', '/');
	//	console.log('cleared ');
	merge(bookFilterStore, { ...init });
};
export const toggleCategory = (
	category: book['category'],
	store: bookFilter = bookFilterStore
) => {
	let v = store;
	if (v.filter.category == category) {
		//disable toggle to make query faster
		//v.filter.category = null;
		v.filter.tags = [];
	} else {
		v.filter.category = category;
		v.filter.tags = [];
	}
	bookFilterStore.filter = { ...bookFilterStore.filter };
};

// update filter orderWith
export const updateSort = ({
	value,
	store = bookFilterStore
}: {
	value: keyof book;
	store?: bookFilter;
}) => {
	let v = store;
	const curr = v.paginate.orderWith;

	if (curr == value) {
		v.paginate.asc = !v.paginate.asc;
	} else {
		v.paginate.orderWith = value;
		v.paginate.asc = false;
	}

	console.log('update filter', v);
	bookFilterStore.filter = { ...bookFilterStore.filter };
};
import stable from 'fast-json-stable-stringify';

export function serializeFilter<T>(data: T | bookFilter) {
	const query = stable(data);
	return query;
}
export function saveFilterToLocalStorage(data: bookFilter) {
	localforage.setItem(FRONT_PAGE, data);
}
export function deserializeFilter<T>(s: string | null) {
	if (!s || s.trim().length == 0) return;
	const query = JSON.parse(s) as T;
	return query;
}
export function trendingBooks() {
	bookFilterStore.paginate.orderWith = 'like_count';
	bookFilterStore.filter.user_modified_at = 'yesterday';
}
export const updateFilter = ({
	key,
	value
}: {
	key: keyof book;
	value: string | number;
}) => {
	const nonToggle: (keyof book)[] = [
		'language',
		'lead',
		'status',
		'maturity_levels'
	];
	if (bookFilterStore.filter[key] === value) {
		if (nonToggle.indexOf(key) == -1) delete bookFilterStore.filter[key];
	} else {
		bookFilterStore.filter[key] = value;
	}
	console.log('update', $state.snapshot(bookFilterStore.filter));
	//this.filter = { ...this.filter };
};
export const updateArrFilter = ({
	key,
	value
}: {
	key: keyof book;
	value: string | number;
}) => {
	const nonToggle: (keyof book)[] = ['maturity_levels'];
	const s = new Set(bookFilterStore.filter[key]);
	if (!bookFilterStore.filter[key]) {
		bookFilterStore.filter[key] = [value];
	} else if (bookFilterStore.filter[key].includes(value)) {
		bookFilterStore.filter[key].splice(
			bookFilterStore.filter[key].indexOf(value),
			1
		);
	} else {
		bookFilterStore.filter[key].push(value);
	}
	console.log('update', bookFilterStore.filter);
	//this.filter = { ...this.filter };
};
export const clear = () => {
	bookFilterStore.filter = { ...init.filter };
	bookFilterStore.paginate = cloneDeep(init.paginate);
	window.history.pushState(null, '', '/');
	console.log('cleared ');
};
