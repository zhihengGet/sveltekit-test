import type { SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createMutation as createMutation } from '@tanstack/svelte-query';

async function signUpF(props: SignUpWithPasswordCredentials) {
	if (Object.hasOwn(props, 'email') == false)
		throw 'bad sign up credentials, no email';
	console.log('sign up', props, window.location.origin + '/?signIn=true');
	const { data, error } = await supabase.auth.signUp(props);

	if (error) throw error;
	return data.user;
}
// handle sign up and create user profiles
export default function useSignUp() {
	//const setUser = useStore((s) => s.setUser);
	return createMutation(() => { return { mutationFn: signUpF } });
}
