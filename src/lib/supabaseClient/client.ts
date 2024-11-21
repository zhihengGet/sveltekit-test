import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL
} from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import { type Session, type SupabaseClient } from '@supabase/supabase-js';

import {
	createBrowserClient,
	createServerClient,
	isBrowser
} from '@supabase/ssr';
import type { Fetch } from '@supabase/supabase-js/dist/module/lib/types';
import { browser } from '$app/environment';
import { handleFetch } from './proxy';

//global supabase client, set during SSR
// will be reinitialized during ssr and hydration process
export let supabase: SupabaseClient<Database>;
/* export const setClientServer = (client) => {
	supabase = client;
}; */
// set during root layout.ts

export const setClient = ({
	data
}: {
	data: { fetch: Fetch; session: Session | null; cookies: any };
}) => {
	if (browser && false) {
		console.log('start client side fetch');
		handleFetch(async ({ fetch, args }) => {
			//console.log('fetch args');
			const keys = ['/rest/v1'];
			let i = false;
			let helper = '';
			//if (args[1]) args[1].credentials = 'include';
			console.log('added credential to include', args[1]);
			for (const x of keys) {
				if (args[0].toString().includes(x)) {
					i = true;
					helper = args[0].toString().split(x)[1] ?? ''; //help text
					break;
				}
			}
			if (args[0].toString().includes('__data.json')) {
				const result1 = Object.fromEntries(args[1]?.headers?.entries?.() ?? []);
				result1['cache-control'] = 'private,no-store';
				console.log('fetching ', args);
				return await fetch(args[0], {
					method: args[1]?.method,
					headers: result1
					//body: JSON.stringify(args)
				});
			}
			if (i && args[1]?.method?.toLowerCase() === 'get') {
				// all get request should be on server for caching purpose

				//const h = args[1].headers;
				///	const result1 = JSON.stringify(Object.fromEntries(args[1].headers));
				return await fetch('/route?' + helper, {
					method: 'POST',
					headers: args[1].headers,
					body: JSON.stringify(args)
				});
			}
			/* 	const result1 = JSON.stringify(Object.fromEntries(args[1].headers));
			const headers = Object.fromEntries(args[1]?.headers?.entries()); 
			console.log(headers);
			debugger;*/

			return await fetch(...args);
		});
	}
	supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				}
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	return supabase;
};
export const resetClient = (client: SupabaseClient<Database>) => {
	supabase = client;
};
export { supabase as supabaseClient };
