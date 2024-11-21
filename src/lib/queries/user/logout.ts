import { invalidateAll } from '$app/navigation';
import { resetUserProfile } from '$lib/state/runes.svelte';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import queryClient from '../client';
async function clearListCookies() {
	await fetch('/route/public/logout', { method: 'DELETE' });
}
export async function log_out() {
	await supabase.auth
		.signOut()
		.catch((e) => console.error('failed to log out from supabase', e));
	localStorage.clear();
	resetUserProfile();
	await clearListCookies();
	await invalidateAll();
	await queryClient.invalidateQueries();
}
