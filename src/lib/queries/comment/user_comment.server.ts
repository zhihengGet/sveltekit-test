/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TABLES } from '$lib/queries/constants';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';

import type { user_comment_data } from '$lib/types';
import { CustomError } from '../base/errors';
import { getLocalUser, getUserIDFromLocalStorage } from '../user';

const table = TABLES.user_comment_data;
async function get(id: number) {
	const userID = await getUserIDFromLocalStorage();
	if (!userID) throw { message: 'not logged in' };
	const { data, error } = await supabase
		.from(table)
		.select()
		.match({ comment_id: id, user_id: userID })
		.maybeSingle();

	if (error) throw error;

	return data;
}

async function update(
	props: Pick<user_comment_data, 'comment_id' | 'is_like'>
) {
	console.log('update user comment data', props);
	const userID = (await getLocalUser()).id;
	const update_user_info = await supabase
		.from(`user_comment_data`)
		.update({ is_like: props.is_like })
		.eq('comment_id', props.comment_id)
		.select('*')
		.single();

	if (update_user_info.error)
		throw new CustomError(update_user_info.error.message);

	console.log('update user comment data', update_user_info);
	return update_user_info.data;
}

async function create(
	props: Pick<user_comment_data, 'comment_id' | 'is_like'>
) {
	console.log('create user comment', props);
	const userID = (await getLocalUser()).id;

	const { data, error } = await supabase
		.from(table)
		.insert({ ...props, user_id: userID })
		.select('*')
		.single();

	console.log('create user comment', data, error);
	if (error) throw error;

	return data;
}

export const user_comment_actions = { update, create, get };
