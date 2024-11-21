import { IsomorphicSanitizer } from '$lib/utils/sanitize';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { getUserIDFromLocalStorage, queryKey } from '..';

import { createQuery } from '@tanstack/svelte-query';

import type { review } from '$lib/types';
import type { paginateQuery } from '$lib/types/pagination';
import { ReviewFieldsCSV, userReviewDataFields } from './fields';
import { keys } from '$lib/utils/getKeys';
import { user } from '$lib/state/runes.svelte';

// keyset based
export async function getReviews(props: paginateQuery<review>) {
	console.log('get reviews', props);
	let data = supabase
		.from('reviews')
		.select(`${ReviewFieldsCSV},user_review_data(is_like)`)
		.match(props.filter)
		.range(props.paginate.start, props.paginate.end - 1);

	for (const x of keys(props.paginate.orderWithMultiple ?? {})) {
		data = data.order(x, {
			ascending: props.paginate?.orderWithMultiple?.[x]!.asc
		});
	}

	const r = await data.order('id', { ascending: false }); // sort ;

	if (r.error) {
		throw r.error;
	}
	if (r.data) {
		for (const x of r.data) {
			x.content = await IsomorphicSanitizer(x.content);
		}
	}

	return r.data;
}

export async function getUserReviews(props: paginateQuery<review>) {
	const uid = await getUserIDFromLocalStorage();
	console.log('props', props);
	const builder = supabase
		.from('reviews')
		.select(
			`${ReviewFieldsCSV},
			books!inner(id,title,cover_url),user_review_data(${userReviewDataFields}) 
		`
		)

		.match({ user_id: props.filter.user_id, ...props.filter })

		.range(props.paginate.start, props.paginate.end);
	for (const x of keys(props.paginate.orderWithMultiple ?? {})) {
		builder.order(x, {
			ascending: props.paginate?.orderWithMultiple?.[x]!.asc
		});
	}
	if (props.paginate.orderWith) {
		builder.order(props.paginate.orderWith, { ascending: false });
	}
	if (props.search?.regex) {
		builder.ilike('books.title', `%${props!.search!.regex ?? ''}%`);
	}
	const { data, error } = await builder;
	if (error) {
		throw error;
	}

	console.log('get user review', data, error);
	if (error) throw error;

	return data;
}
export async function getTotalUserReviewCount() {
	const uid = await getUserIDFromLocalStorage();
	const { data, error, count } = await supabase
		.from('reviews')
		.select('id', { head: true, count: 'exact' })
		.match({ user_id: uid });

	console.log('get user review count', data, error);
	if (error) throw error;
	return count;
}
export async function getUserReview(bookID: number) {
	const uid = await getUserIDFromLocalStorage();

	const { data, error } = await supabase
		.from('reviews')
		.select(`${ReviewFieldsCSV},user_review_data(is_like)`)
		.match({ book_id: bookID, user_id: uid })
		.eq('user_review_data.user_id', uid)
		.limit(1)
		.maybeSingle();
	console.log('get self review', data, error);
	if (error) throw error;

	return data;
}
