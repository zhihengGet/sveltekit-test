import { client } from '$lib/queries/api';
import { responseUnwrap } from '$lib/queries/util';
import { createMutation } from '@tanstack/svelte-query';
import type { InferRequestType } from 'hono';

type mutate =
	typeof client.rest.api.user_setting.protected.setting_global.$post;
export function useUpdateUserSettings() {
	return createMutation(() => { return {
		mutationFn: async (props: Parameters<mutate>[0]['json']) => {
			const data =
				await client.rest.api.user_setting.protected.setting_global.$post({
					json: props
				});
			console.log('mutate setting', data);

			return responseUnwrap(data);
		}
	} });
}
export function useUpdateUserBookTheme() {
	return createMutation(() => { return {
		mutationFn: async (
			props: Parameters<
				typeof client.rest.api.user_setting.protected.book_theme.$post
			>[0]['json']
		) => {
			const data =
				await client.rest.api.user_setting.protected.book_theme.$post({
					json: props
				});
			console.log('mutate setting', data);

			return responseUnwrap(data);
		}
	} });
}
