import { supabase } from '$lib/supabaseClient/client';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { getUserIDFromLocalStorage, queryKey } from '..';
import { DEFAULT_FOLDER, MAX_FOLDERS_SIZE } from '$lib/data/constants';
import { CustomError } from '../base/errors';
import { user } from '$lib/state/runes.svelte';

async function update(new_folders: string[]) {
	const uid = await getUserIDFromLocalStorage();

	if (new_folders.length > MAX_FOLDERS_SIZE) {
		throw new CustomError(
			'Maximum folder size exceeded!You can only create 200 folders'
		);
	}
	const data = await supabase
		.from('user_shelf_settings')
		.upsert(
			{ user_id: uid, folders: new_folders },
			{ onConflict: 'user_id', ignoreDuplicates: false }
		);

	if (data.error) throw data.error;
	return new_folders;
}

async function get() {
	const uid = await getUserIDFromLocalStorage();
	const { data, error } = await supabase
		.from('user_shelf_settings')
		.select('folders,updated_at,created_at')
		.eq('user_id', uid)
		.maybeSingle();
	if (error) throw error;

	if (!data) {
		return { folders: [] };
	}
	return data;
}

export function useGetShelfFolders() {
	return createQuery(() => ({
		queryFn: get,
		queryKey: queryKey.getShelfFolders(),
		enabled: user.authStatus === 'signed in'
	}));
}

// change book's folder
export function useUpdateShelfFolder() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		mutationKey: queryKey.getShelfFolders(),
		onSuccess: (new_folders: string[]) => {
			//debugger;
			client.setQueryData(
				queryKey.getShelfFolders(),
				(old: ReturnType<typeof useGetShelfFolders>['data']) => {
					const copy = old;
					if (copy) {
						copy.folders = new_folders;
						return JSON.parse(JSON.stringify(old));
					}
					return JSON.parse(JSON.stringify(old));
				}
			);
		}
	} });
}
