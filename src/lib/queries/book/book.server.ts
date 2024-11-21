/* eslint-disable prefer-const */
// server apis
import { getUserStoreValue } from '$lib/state/store';
import { supabase, supabaseClient } from '$lib/supabaseClient/client';
import type { book, bookWithUserInfo, paginateQuery } from '$lib/types';
import { bookCols } from './fields';
import { getPublicAvatarUrl } from '../storage/useUpload';
import { getLocalUser, getUserIDFromLocalStorage } from '../user';
const BOOK_TABLE = TABLES.books;
/**
 * @description create books
 * @param props  Omit<book, 'id' | 'secret_key'> & { secret_key?: string; name: string }
 * @returns book
 */
export async function createServerBook(
	props: Pick<
		book,
		| 'category'
		| 'tags'
		| 'language'
		| 'price'
		| 'title'
		| 'summary'
		| 'authors_words'
		| 'status'
		| 'cover_url'
		| 'lead'
	> & { author_name: string; author_id: string }
) {
	const username = getUserStoreValue().username;
	const id = (await getLocalUser()).id;
	//let secret_key = props.secret_key; //TODO add secret key
	props.author_name = username;
	props.author_id = id;

	props.cover_url = await getPublicAvatarUrl();
	console.log('create book ', props);
	//delete props.secret_key;
	const { data, error } = await supabaseClient
		.from('books')
		.insert(props)
		.select(`${bookCols}`)
		.single();

	console.log(data, error);
	if (error) throw error;

	return data;
}

import { timeRangeMapper } from '$lib/data/filter';
import { TABLES } from '../constants';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { getSearchClient } from '../../../routes/(api)/rest/utils/middleware.server';
import type { SearchParams } from 'typesense/lib/Typesense/Documents';
const date = new Date().toUTCString();
/**
 * @description return front page books
 * @returns array of books
 */
export async function getServerBooks /* <T extends paginateQuery<book>> */(
	props: paginateQuery<book>
) /* : Promise<
	'countStrategy' extends keyof T['options'] ? number : bookWithUserInfo[]
>  */ {
	let shouldCount = !!props.options?.countStrategy;
	let join = props.join?.inner
		? 'user_book_data!inner(is_shelved,book_id,user_id,folder)'
		: 'user_book_data(is_shelved,book_id,user_id,folder)';

	console.log('get books ', props, shouldCount);
	const uid = await getUserIDFromLocalStorage().catch((e) => {
		return undefined;
	});
	let builder = supabaseServer()
		.from(BOOK_TABLE)
		.select(
			props.join?.withUserInfo && uid ? `${bookCols}, ${join}` : bookCols,
			{
				count: shouldCount ? props?.options?.countStrategy : undefined,
				head: shouldCount
			}
		);

	if (props.join?.withUserInfo && uid)
		builder.eq('user_book_data.user_id', uid);

	if (props.restFilter) {
		for (let x of props.restFilter) {
			builder = builder.filter(x[0], x[1], x[2]);
		}
	}

	if (props.filter) {
		if (props.filter.id) {
			builder.eq('id', props.filter.id);
		}
		if (props.filter.character_count) {
			builder = builder.gte('word_count', props.filter.word_count);
		}
		if (props.filter.author_id) {
			builder = builder.eq('author_id', props.filter.author_id);
		}
		if (typeof props?.filter.is_visible == 'boolean') {
			builder = builder.eq('is_visible', props?.filter.is_visible);
		} else {
			builder = builder.eq('is_visible', true);
		}
		/* builder = builder.match({
			is_visible: isNil(props.filter.is_visible)
				? true
				: props.filter.is_visible
		}); */

		if (props.filter.category)
			builder = builder.eq('category', props.filter.category);
		if (props.filter.language)
			builder = builder.eq('language', props.filter.language);
		if (props.filter.status)
			builder = builder.eq('status', props.filter.status);
		if (props.filter.maturity_levels?.length)
			builder = builder.contains(
				'maturity_levels',
				props.filter.maturity_levels
			);
		if (props.filter.lead) builder = builder.eq('lead', props.filter.lead);
		if (props.filter.tags && props.filter.tags.length > 0)
			builder = builder.contains('tags', props.filter.tags.sort() ?? []);
		if (props.filter.age_range) {
			builder = builder.or(
				`age_range.cd."${props.filter.age_range}",age_range.is.null`
			);
		}
		if (props.filter.created_at) {
			const date =
				props.filter.created_at in timeRangeMapper
					? //@ts-expect-error ts sad
						timeRangeMapper[props.filter.created_at]()
					: null;
			if (date) builder.gte('created_at', date);
		}
		if (props.filter.user_modified_at) {
			builder = builder.gte(
				'user_modified_at',
				//@ts-expect-error ts sad
				timeRangeMapper[props.filter.user_modified_at]()
			);
		}
	}

	if (props.search?.regex) {
		builder = builder.ilike('title', '%' + props.search.regex + '%');
	}

	if (props.paginate && !props.options?.countStrategy)
		builder = builder
			.range(
				props.paginate.start, // if not first page, add one,  ex:  0 - 9 10-19 21-30
				props.paginate.end - 1
			)
			.lte('created_at', date); //WARN do not include new books created during pagination, stable filtering
	if (props.paginate?.orderWith)
		builder = builder
			.order(props.paginate.orderWith, { ascending: props.paginate.asc })
			.order('id', { ascending: true });

	if (props.paginate?.orderWithMultiple) {
		for (const x in props.paginate?.orderWithMultiple)
			builder = builder
				.order(x, { ascending: props.paginate.orderWithMultiple[x].asc })
				.order('id', { ascending: true });
	}
	const { data, error, count } = await builder;
	console.log('return front page books', data?.length, count);

	if (error) {
		console.log('error', error);
		throw new Error(error.message);
	}
	if (shouldCount) return count;
	return data as unknown as bookWithUserInfo[];
}
/**
 *
 * @param book
 * @returns search book by title or author
 */
export async function searchBooks(text: string) {
	console.log('search text', text);
	if (text == '' || !text) return [];
	const { data, error } = await supabase.rpc('search_books', {
		text: text.trim(),
		count: 10,
		skip: 0,
		sort: 'shelved_count'
		//offset: 0
	});

	console.log('search  book', data);
	if (error) throw error;
	if (!data) return [];

	return data as book[];
}
export async function getFacetValues() {
	const client = getSearchClient();
	const data = await client.collections('books').documents().search({
		q: '',
		query_by: 'category',
		facet_by: 'category',
		sort_by: 'average_rating:desc'
	});
	return data;
}

/**
 * @description return front page books
 * @returns array of books
 */
export async function getServerBooksSearcher /* <T extends paginateQuery<book>> */(
	props: paginateQuery<book>
) /* : Promise<
	'countStrategy' extends keyof T['options'] ? number : bookWithUserInfo[]
>  */ {
	let shouldCount = !!props.options?.countStrategy;
	let join = props.join?.inner
		? 'user_book_data!inner(is_shelved,book_id,user_id,folder)'
		: 'user_book_data(is_shelved,book_id,user_id,folder)';

	const client = getSearchClient();
	console.log('get books ', props, shouldCount);
	const uid = await getUserIDFromLocalStorage().catch((e) => {
		return undefined;
	});
	let searchParameters: SearchParams = {
		q: '',
		query_by: 'title',
		filter_by: '',
		sort_by: ''
		//	facet_by: 'category'
	};

	let filters = '';
	function chainArray(field: string, list: string[]) {
		for (let x of list) {
			filters += field + ' := ' + x + ' && ';
		}
	}
	if (props.filter) {
		if (props.filter.id) {
			filters += 'id :=' + props.filter.id + ' && ';
		}
		if (props.filter.character_count) {
			filters += 'word_count :>' + props.filter.word_count + ' && ';
			//builder = builder.gte('word_count', props.filter.word_count);
		}
		if (props.filter.author_id) {
			filters += 'author_id :=' + props.filter.word_count + ' && ';
		}
		if (typeof props?.filter.is_visible == 'boolean') {
			filters += 'is_visible :=' + props.filter.is_visible + ' && ';
		} else {
			filters += 'is_visible := true' + ' &&';
		}
		/* builder = builder.match({
			is_visible: isNil(props.filter.is_visible)
				? true
				: props.filter.is_visible
		}); */

		if (props.filter.category)
			filters += 'category := ' + props.filter.category + ' && ';
		if (props.filter.language)
			filters += 'language := ' + props.filter.language + ' && ';
		if (props.filter.status)
			filters += 'status := ' + props.filter.status + ' && ';
		if (props.filter.maturity_levels?.length)
			filters += 'maturity_levels :=' + props.filter.maturity_levels + ' && '; //we only have one item in array
		if (props.filter.lead) filters = 'lead := ' + props.filter.lead + ' && ';
		if (props.filter.tags && props.filter.tags.length > 0)
			chainArray('tags', props.filter.tags);
		// if (props.filter.audience) {
		// 	filters +=
		// 		'audience :=`' + props.filter.audience + '` &&';

		// 	//	'age_range := (`' +
		// 	// 	props.filter.age_range +
		// 	// 	'` || age_range := null) && ';
		// }
		if (props.filter.audience) {
			filters += 'audience :=`' + props.filter.audience + '` && ';
		}
		if (props.filter.created_at) {
			const date =
				props.filter.created_at in timeRangeMapper
					? //@ts-expect-error ts sad
						timeRangeMapper[props.filter.created_at]()
					: null;
			if (date) {
				filters += 'created_at :>=' + new Date(date).getTime() + ' && ';
			}
		}
		if (props.filter.user_modified_at) {
			const modified =
				props.filter.user_modified_at in timeRangeMapper
					? //@ts-expect-error ts sad
						timeRangeMapper[props.filter.user_modified_at]()
					: null;
			if (modified)
				filters +=
					'user_modified_at :>= ' + new Date(modified).getTime() + ' &&';
		}
	}

	if (props.search?.regex) {
		searchParameters.q = props.search.regex;
	}

	if (props.paginate && !props.options?.countStrategy) {
		searchParameters.per_page = props.paginate.end - props.paginate.start;
		searchParameters.page =
			props.paginate.start / searchParameters.per_page + 1;
	}
	if (props.paginate?.orderWith)
		searchParameters.sort_by = props.paginate?.orderWith + ':desc';

	if (props.paginate?.orderWithMultiple) {
		for (const x in props.paginate?.orderWithMultiple)
			searchParameters.sort_by +=
				x + ':' + props.paginate.orderWithMultiple[x as any as keyof book].asc
					? 'asc'
					: 'desc';
	}
	if (filters.trim().endsWith('&&')) {
		filters = filters.substring(0, filters.length - 2);
	}
	searchParameters.filter_by = filters;
	if (!searchParameters.sort_by) {
		delete searchParameters.sort_by;
	}
	console.log('search params', searchParameters);
	const data = await client
		.collections('books')
		.documents()
		.search(searchParameters);

	/* If you have say 10K documents in total in your collection, and for a given query only 150 of them are matched as results, out_of will be 10K and found will be 150. */
	console.log(
		'return front page books',
		data.found,
		data.search_time_ms,
		data.out_of
	);

	return data;
}
