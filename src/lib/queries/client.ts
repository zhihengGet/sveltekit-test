import { difference } from 'lodash-es';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/svelte-query';
//import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { browser, dev } from '$app/environment';
import { toastNotify } from '$lib/utils/toast';
import stringify from 'fast-json-stable-stringify';
import { CustomError } from './base/errors';
import type { PostgresError } from 'postgres';
const GENERIC =
	'Unknown Error Occurred Please Contact support and try again later!';

const commentRemovalError = {
	code: '23503',
	details: 'Key is still referenced from table "comments".',
	hint: null,
	message:
		'update or delete on table "comments" violates foreign key constraint "comments_parent_id_fkey1" on table "comments"'
};

export function isNoRow(err: PostgrestError) {
	if (err.message.includes('multiple (or no) rows')) {
		return true;
	}
	return false;
}
function getText(error: CustomError | PostgresError | PostgrestError) {
	/* 	if (error && error.__isAuthError) {
		return error.message;
	} */
	let msg = error.message ?? ''; /* dev
		? error.message
		: error instanceof CustomError
			? error?.friendly_message ?? GENERIC
			: GENERIC; */
	if (
		msg.includes('comments') &&
		msg.includes('foreign key constraint') &&
		error?.code === commentRemovalError.code
	) {
		msg =
			'Sorry You cannot delete comments with replies ! You can only modify it!';
	}
	if (msg.includes('multiple (or no) rows')) {
		msg = 'Empty Data Error';
	}
	if (msg.includes('duplicate key value violates unique constraint')) {
		msg = 'Sorry, value already exists! ';
	}
	if (msg.includes('Auth session missing')) {
		msg = 'Try Login Again ! Your Login Session Expired';
	}
	return msg;
}
const queryCache = new QueryCache({
	onError: (e, query) => {
		const error = e as CustomError | PostgresError;
		console.error('QUERY ERROR', error);
		let msg = getText(error);
		if (query.meta?.toast === true) {
			toastNotify.error(msg);
		}
	},
	onSuccess: (data, query) => {
		console.log('QUERY SUCCESSFUL', data);
	}
});

const mutationCache = new MutationCache({
	onError: (e, variable, context, setting) => {
		const error = e as CustomError | PostgresError;
		let msg = getText(error);
		toastNotify.error(msg);
	},
	onSuccess: (data, variable, context, setting) => {
		if (setting.meta?.toast == true) {
			toastNotify.success(setting.meta.toastMessage ?? 'successful');
		}
		console.log('MUTATION SUCCESSFUL', data);
	}
});

const queryClient = new QueryClient({
	queryCache,
	mutationCache,
	defaultOptions: {
		queries: {
			enabled: browser,
			retry: 1,
			gcTime: 1000 * 60 * 60, // 1hr,
			staleTime: 1000 * 60 * 5,
			queryKeyHashFn: dev ? stringify : undefined,
			refetchOnWindowFocus: true
			//persister: localStoragePersister
			//cacheTime: 1000 * 60 * 60 * 6, // 4 hours
		}
	}
});

import {
	persistQueryClient,
	experimental_createPersister
} from '@tanstack/svelte-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { queryKey } from './constants';
import type { PostgrestError } from '@supabase/supabase-js';

if (browser) {
	const localStoragePersister = experimental_createPersister({
		storage: window.sessionStorage,
		prefix: 'what a nice query',
		filters: {
			predicate: (args) => {
				if (args.meta?.persist === true) {
					return true;
				}
				// only cache chapter list for now
				if (
					args.queryKey.length === 4 &&
					new Set(args.queryKey).has('public') &&
					new Set(args.queryKey).has('chapter')
				) {
					return true;
				}

				return false;
			}
		}
		//maxAge: 1000 * 3600 * 4 // 1hr
	});
	queryClient.setDefaultOptions({
		queries: {
			enabled: browser,
			retry: 1,
			gcTime: 1000 * 60 * 60, // 1hr,
			staleTime: 1000 * 60 * 5,
			queryKeyHashFn: dev ? stringify : undefined,
			persister: localStoragePersister,
			refetchOnWindowFocus: true
		}
	});
	/* persistQueryClient({
		queryClient,
		persister: localStoragePersister
	}); */
	//TODO does not support svelte proxied
	/* broadcastQueryClient({
		queryClient,
		broadcastChannel: 'what a nice query'
	}); */
}

export default queryClient;
