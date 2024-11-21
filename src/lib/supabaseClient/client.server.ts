import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/types';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ADMIN } from '$env/static/private';

export const supabaseServer = () =>
	createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_ADMIN, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	});
export const supabaseServerFn = () =>
	createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_ADMIN);
