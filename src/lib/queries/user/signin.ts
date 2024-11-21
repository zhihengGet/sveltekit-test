import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createMutation as createMutation } from '@tanstack/svelte-query';

export default function useSignIn() {
	async function login(params: SignInWithPasswordCredentials) {
		const data = await supabase.auth.signInWithPassword(params);
		console.log('log in ', data);
		if (data.error) throw data.error;

		return data.data.user;
	}

	return createMutation(() => { return { mutationFn: login, gcTime: 0 } });
}
