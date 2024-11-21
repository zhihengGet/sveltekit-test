import type { book, bookWithUserInfo, paginateQuery } from '$lib/types';
import { createQuery, createQuery as useQuery } from '@tanstack/svelte-query';
import type { InferRequestType } from 'hono/client';
import { debouncedCheckTitle } from '.';
import { client } from '../api';
import { CustomError } from '../base/errors';
import { TABLES, queryKey } from '../constants';
import { debouncePromise, responseUnwrap } from '../util';

const BOOK_TABLE = TABLES.books;
export type authorGet = InferRequestType<
	typeof client.rest.api.books.public_authored_book_list.$get
>['query'];
// get user's or someone else authored books
export async function getAuthoredBooks(props: authorGet) {
	const res = await client.rest.api.books.public_authored_book_list.$get({
		query: { author_id: props.author_id }
	});
	return responseUnwrap(res);
}

const date = new Date().toUTCString(); //FIXME need book create date to have stable filter?
/**
 * @description return front page books
 * @returns array of books
 */
export async function getBooks /* <T extends paginateQuery<book>> */(
	props: paginateQuery<book>
) {
	console.log('getBooks', props);
	const get = client.rest.api.books.getBooks.$post;

	const r = await get({
		json: props
	});
	const res = await r.json();
	if (r.status !== 200) {
		throw new Error(res?.message ?? 'Error with fetching books');
	}

	return res;
}
// get a single book
export async function getBook(props: { id: string }, throwError = true) {
	//let withUserData = props.withUserData ?? true;
	//	const cols = props.cols ? ',' + props.cols : '';
	/* 	const uid = await getUserIDFromLocalStorage().catch((e) => {
		console.log('user not logged in dont get user_book_data for book');
		withUserData = false;
	}); */
	/* if (uid && props.withUserData) {
		//@ts-expect-error ts32
		props['user_book_data.user_id'] = uid;
	} */
	/* delete props.withUserData;
	delete props.cols; */
	const data = await client.rest.api.books.getBook.$get({
		query: { book_id: props.id }
	});
	console.log('fetching specific book', data);
	const r = await data.json();
	if (data.status !== 200) {
		throw new CustomError(r?.message ?? 'Error while fetching your book');
	}
	return r;
}
/**
 * @param book
 * @returns get similar books
 */
/* async function get_similar_books(book: book) {
	const { data, error } = await supabase
		.from(BOOK_TABLE)
		.select(bookCols)
		.eq('category', book.category)
		.overlaps('tags', book.tags ?? [])
		.neq('id', book.id);
	console.log('get similar books ', data, error);
	if (error) throw error;
	return data;
} */

/**
 *
 * @param book
 * @returns search book by title or author
 */
async function searchBooks(text: string) {
	console.log('search text', text);
	if (text == '' || !text) return [];
	const data = await client.rest.api.books.search.$get({
		query: { searchString: text }
	});

	console.log('search  book', data);

	return responseUnwrap(data);
}
/**
 * @param book data
 * @return a specific book
 */
export function useGetBook(
	props: () => {
		initialData: bookWithUserInfo | null;
		book_id: number;
	}
) {
	return props().initialData
		? useQuery(() => {
				return {
					queryKey: queryKey.getBook(props().book_id),
					queryFn: async () => {
						const get = client.rest.api.books.getBook.$get;

						const data = await get({
							query: { book_id: props().book_id + '' }
						});

						const res = await data.json();

						if (data.status !== 200)
							throw new CustomError(res.message ?? 'Failed fetching book ');
						return res;
					},
					initialData: props().initialData
				};
			})
		: useQuery(() => {
				return {
					queryKey: queryKey.getBook(props().book_id),
					queryFn: async () => {
						const get = client.rest.api.books.getBook.$get;

						const data = await get({
							query: { book_id: props().book_id + '' }
						});

						const res = await data.json();

						if (data.status !== 200)
							throw new CustomError(res.message ?? 'Failed fetching book ');
						return res;
					}
				};
			});
}

/**
 * @description get books for profile page, public only
 * @param {getAuthorBooks}
 * @returns array of books
 */
export function useGetAuthoredBooks(prop: () => authorGet) {
	return useQuery(() => {
		return {
			queryKey: queryKey.getAuthoredBooks(prop()),
			queryFn: () => getAuthoredBooks(prop()),
			refetchOnWindowFocus: true
		};
	});
}

export function useGetAllAuthoredBooks() {
	return useQuery(() => {
		return {
			queryKey: queryKey.getAllAuthoredBooks(),
			queryFn: async () => {
				const data =
					await client.rest.api.books.protected.authored_books.$get();
				return responseUnwrap(data) as book[];
			},
			refetchOnWindowFocus: true
		};
	});
}

/**
 * @description get books for front page
 * @returns array of books
 */
export function useGetBooks(data: () => paginateQuery<book>) {
	const debGetBooks = debouncePromise(getBooks);
	return useQuery(() => {
		return {
			queryKey: queryKey.getBooks(data()),
			queryFn: () =>
				data().options?.shouldDebounce ? debGetBooks(data()) : getBooks(data()),
			//suspense: true,
			staleTime: 1000 * 60 * 60
			//placeholderData: keepPreviousData
		};
	});
}

/**
 * @description get books for front page
 * @returns array of books
 */
export function useGetPublicAuthoredBooksPaginate(
	data: () => paginateQuery<book>
) {
	return useQuery(() => ({
		queryKey: queryKey.getBooks(data()),
		queryFn: async () => {
			const ret =
				await client.rest.api.books.public_authored_books_paginate.$post({
					json: data()
				});

			return responseUnwrap(ret);
		},
		staleTime: 1000 * 60 * 60
	}));
}

/**
 * @description get books for front page
 * @returns  count based on filter
 */
export function useGetBooksCount(data: () => paginateQuery<book>) {
	const debGetBooks = debouncePromise(getBooks);
	return useQuery(() => {
		return {
			queryKey: queryKey.getBooks(data()),
			queryFn: (): number =>
				data().options?.shouldDebounce ? debGetBooks(data()) : getBooks(data()),
			staleTime: 1000 * 60 * 60
		};
	});
}
/**
 * @description get books for front page based on filterStore
 * @returns array of books
 */
/* export function useGetFrontPageBooks() {
	return useQuery({
		queryKey: queryKey.getBooks(bookFilterStore),
		queryFn: () => getBooks(bookFilterStore),
		//suspense: true,
		staleTime: 1000 * 600,
		//keepPreviousData: true,
		meta: { toast: false }
	});
} */
/**
 * @description get similar book based on title ,category, tags
 * @returns array of books
 */
/* export function useSimilarBooks(book: book) {
	return useQuery({
		queryKey: queryKey.getSimilarBooks(book?.id),
		queryFn: async () => get_similar_books(book),
		enabled: book?.id != undefined
	});
} */
const deb = debouncePromise(searchBooks);
/**
 * @param book data
 * @return search a specific book by book title and author
 */
export function useSearchBooks(text: () => { searchText: string }) {
	return useQuery(() => {
		return {
			queryKey: ['searchBooks', text()],
			queryFn: () => deb(text().searchText),
			staleTime: 500,
			meta: { toast: false }
		};
	});
}

export function useCheckTitle(s: () => { title: string }) {
	return createQuery(() => ({
		queryKey: ['check title', s()],
		queryFn: () => debouncedCheckTitle(s().title),
		enabled: s().title?.length > 0
	}));
}
export function useGetBookConfig(data: () => { book_id: string | undefined }) {
	return useQuery(() => ({
		queryKey: ['book_config', data()],
		queryFn: async () => {
			const info = await client.rest.api.books.author_book_setting.$get({
				query: { book_id: '' + data().book_id }
			});
			return responseUnwrap(info);
		},
		refetchOnWindowFocus: true,
		enabled: typeof data().book_id !== 'undefined'
	}));
}
export function useGetBookReadHistory(data: () => boolean) {
	return useQuery(() => ({
		queryKey: ['read history', data()],
		queryFn: async () => {
			const info =
				await client.rest.api.books.protected.recent_read_books.$get();
			return responseUnwrap(info);
		},
		refetchOnWindowFocus: true,
		enabled: data()
	}));
}
export function useGetFacetValue() {
	return useQuery(() => ({
		queryKey: ['facet', 'book'],
		queryFn: async () => {
			const info = await client.rest.api.books.facet.default.$get();
			return responseUnwrap(info);
		}
		//refetchOnWindowFocus: true,
		//enabled: data()
	}));
}
