import { supabase } from '$lib/supabaseClient/client';
import {
	createMutation,
	createQuery,
	useQueryClient
} from '@tanstack/svelte-query';
import { getUserIDFromLocalStorage, queryKey } from '..';
import { CustomError } from '../base/errors';
import { MAX_FOLDERS_SIZE } from '$lib/data/constants';
import type { author_book_buckets } from '$lib/types';

async function update(new_folders: string[]) {
	const uid = await getUserIDFromLocalStorage();
	if (new_folders.length > MAX_FOLDERS_SIZE) {
		throw new CustomError(
			'Maximum folder size exceeded!You can only create 200 folders'
		);
	}
	const data = await supabase
		.from('author_book_buckets')
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
		.from('author_book_buckets')
		.select('folders,updated_at,created_at')
		.eq('user_id', uid)
		.maybeSingle();
	if (error) throw error;

	return data;
}
const KEY = 'author books folders';
export function useGetAuthorFolders() {
	return createQuery(() => ({
		queryFn: get,
		queryKey: queryKey.getAuthorFolders()
	}));
}

// change book's folder
export function useUpdateAuthorFolder() {
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: update,
		mutationKey: queryKey.getAuthorFolders(),
		onSuccess: (data) => {
			client.setQueryData(
				queryKey.getAuthorFolders(),
				(old: ReturnType<typeof useGetAuthorFolders>['data']) => {
					const copy = JSON.parse(JSON.stringify(old));
					if (copy) {
						copy.folders = data;
						return JSON.parse(JSON.stringify(copy));
					}
					return {
						folders: data,
						created_at: new Date().toUTCString()
					} as author_book_buckets;
				}
			);
		},
		meta: { toast: true }
	} });
}
