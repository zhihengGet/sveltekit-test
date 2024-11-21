import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createQuery as useQuery } from '@tanstack/svelte-query';
import type { ID, profile } from '$lib/types';
import { loginError } from '../base/errors';
import { client } from '../api';
import { responseUnwrap } from '../util';
import { user } from '$lib/state/runes.svelte';

export async function getLocalUser() {
	const data = (await supabase.auth.getSession()).data.session?.user;
	if (!data) {
		throw loginError;
	}
	return data;
}
export async function getUserIDFromLocalStorage() {
	return (await getLocalUser()).id;
}
/**
 *
 * @returns fetch user id from server
 */
export async function getUID() {
	console.warn('Getting UID from remote');
	return (await supabase.auth.getUser()).data.user!.id;
}

export async function getOpenUserProfile(user: Partial<profile> | null) {
	const uid = user?.id ?? (await getLocalUser())?.id;
	console.log('🚀 ~ file: getUser.ts:33 ~ getUserProfile ~ uid:', uid, user);
	const info = await client.rest.api.self.profile.$get({
		query: { id: uid }
	});

	return responseUnwrap(info);
}

export function useGetUserProfile(user: () => Partial<profile> | null) {
	return useQuery(() => {
		return {
			queryKey: ['getUser', user],
			queryFn: async () => {
				const info = await client.rest.api.self.profile.$get({
					query: {
						id: user().id
					}
				});

				return responseUnwrap(info);
			},
			gcTime: 0,
			staleTime: 1000 * 3600,
			refetchOnWindowFocus: true,
			meta: {
				persist: true
			}
		};
	});
}

export function useGetUserMainSetting() {
	return useQuery(() => {
		return {
			queryKey: ['user_main_setting'],
			queryFn: async () => {
				const info =
					await client.rest.api.user_setting.protected.setting_global.$get();

				return responseUnwrap(info);
			},
			gcTime: 0,
			staleTime: 0,
			refetchOnWindowFocus: true,
			enabled: user.authStatus === 'signed in'
		};
	});
}
export function useGetUserBookTheme(data: () => { book_id: ID }) {
	return useQuery(() => ({
		queryKey: ['book_theme', data()],
		queryFn: async () => {
			const info = await client.rest.api.user_setting.protected.book_theme.$get(
				{
					query: { book_id: data().book_id }
				}
			);
			return responseUnwrap(info);
		},
		refetchOnWindowFocus: true,
		enabled:
			typeof data().book_id !== 'undefined' && user.authStatus === 'signed in'
	}));
}
