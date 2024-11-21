import { createQuery } from '@tanstack/svelte-query';

import { supabaseClient } from '$lib/supabaseClient/client';
import { getUserIDFromLocalStorage } from '../user';
import { queryKey } from '../constants';
import type { editor_setting, ID } from '$lib/types';
import { client } from '../api';
import { responseUnwrap } from '../util';

type input = { bookID: ID };
async function getSetting({ bookID }: input) {
	const uid = await getUserIDFromLocalStorage();

	//delete props.secret_key;

	const res = await client.rest.api.user_setting.protected.user_editor_setting[
		':book_id'
	].$get({
		param: {
			book_id: bookID
		}
	});
	/* const { data, error } = await supabaseClient
		.from('user_editor_settings')
		.select('*')
		.eq('user_id', uid)
		.eq('book_id', bookID)
		.maybeSingle(); */
	/* 	if (error) throw error; */

	return responseUnwrap(res);
}

export function useGetUserEditSetting(input: () => input) {
	return createQuery(() => {
		return {
			queryKey: queryKey.getEditSetting(input()),
			queryFn: () => getSetting(input()),
			select: (data) => {
				return data;
			},
			enabled: typeof input().bookID == 'string'
		};
	});
}
