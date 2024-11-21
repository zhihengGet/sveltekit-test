import { supabaseClient } from '$lib/supabaseClient/client';
import type { editor_setting, user_editor_setting } from '$lib/types';
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { getUserIDFromLocalStorage, queryKey } from '..';
import { CustomError, loginError } from '../base/errors';
import { client } from '../api';
import { responseUnwrap } from '../util';

/**
 * @description create books
 * @param props  Omit<book, 'id' | 'secret_key'> & { secret_key?: string; name: string }
 * @returns book
 */
export async function createEditSetting(
	props: Pick<editor_setting, 'book_id' | 'setting'>
) {
	console.log('create book ', props);
	props.setting;
	const id = await getUserIDFromLocalStorage();
	if (!id) throw loginError;

	if (props.setting.wordBank.length > 500) {
		throw new CustomError('too many words in the bank ! Max 500!');
	}
	const res =
		await client.rest.api.user_setting.protected.user_editor_setting.$patch({
			json: props
		});
	/* 	const { data, error } = await supabaseClient
		.from('user_editor_settings')
		.upsert({ user_id: id, setting: props.setting, book_id: props.book_id })
		.eq('user_id', id)
		.eq('book_id', props.book_id)
		.select('*')
		.single(); */

	return responseUnwrap(res);
}

export function useAddKeyword() {
	const client = useQueryClient();
	return createMutation(() => {
		return {
			mutationFn: createEditSetting,
			onSuccess: (data) => {
				client.setQueryData(
					queryKey.getEditSetting({ bookID: data.book_id }),
					() => {
						return data;
					}
				);
			}
		};
	});
}
