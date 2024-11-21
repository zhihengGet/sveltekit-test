import { queryKey, TABLES } from '$lib/queries/constants';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';

import { getLocalUser, getUserIDFromLocalStorage } from '$lib/queries/user';
import { getUserStoreValue } from '$lib/state/store';
import type { reviewWithUserInfo, user_review_data } from '$lib/types';
import { loginError } from '../base/errors';
const table = TABLES.user_review_data;
async function get(reviewID: number) {
	const userID = (await supabase.auth.getUser()).data.user?.id;
	if (!userID) throw { message: 'not logged in' };
	const { data, error } = await supabase
		.from(table)
		.select()
		.match({ review_id: reviewID, user_id: userID })
		.maybeSingle();

	if (error) throw error;

	return data;
}

async function update(props: Pick<user_review_data, 'review_id' | 'is_like'>) {
	console.log('update user review data', props.is_like);
	const userID = (await getLocalUser()).id;
	const { data, error } = await supabase
		.from(table)
		.update({
			is_like: props.is_like ?? null
		})
		.match({ user_id: userID, review_id: props.review_id })
		.single();

	console.log('update user review data', data, error);
	if (error) throw error;

	return { ...props, user_id: userID, review_id: props.review_id };
}

async function create(props: Pick<user_review_data, 'is_like' | 'review_id'>) {
	console.log('create user review', props);
	const userID = await getUserIDFromLocalStorage();
	const username = getUserStoreValue().username;
	if (!userID || !username) throw loginError;
	const { data, error } = await supabase
		.from(table)
		.insert({
			is_like: props.is_like,
			user_id: userID,
			review_id: props.review_id
		})
		.select('*')
		.single();

	console.log('create user review', data, error);
	if (error) throw error;

	return data;
}

export const review_user_actions = { create, update, get };
