import { supabase } from '$lib/supabaseClient/client';
import type { chapter, user_chapter_data } from '$lib/types';
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { user_chapter_data_fields } from './fields';
import { contains, removeNil } from '$lib/queries/util';
import { getLocalUser } from '$lib/queries/user/getUser';

type props = Omit<Partial<user_chapter_data>, 'chapter_id'> & {
	chapter_id: number;
};
async function update(args: props) {
	const uid = (await getLocalUser()).id;
	args.user_id = uid;

	removeNil(args, ['is_like']);
	const data = await supabase
		.from('user_chapter_data')
		.update({ ...args })
		.match({ chapter_id: args.chapter_id, user_id: uid })
		.select(user_chapter_data_fields)
		.single();

	if (data.error) throw data.error;
	return data.data;
}
async function create(args: props) {
	const uid = (await getLocalUser()).id;
	if (!args.book_id || !args.chapter_id) throw new Error('missing required id');
	removeNil(args, ['is_like']);
	const data = await supabase
		.from('user_chapter_data')
		.insert({ ...args, user_id: uid })
		.select(user_chapter_data_fields)
		.single();

	if (data.error) throw data.error;
	return data.data;
}

export const chapter_user_action = { update, create };
