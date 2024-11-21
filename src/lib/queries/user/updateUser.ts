import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { disjoint, removeNil, responseUnwrap } from '../util';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';
import type { profile } from '$lib/types';
import { UsernameExistsError, loginError } from '../base/errors';
import { getUserIDFromLocalStorage } from './getUser';
import { user } from '$lib/state/runes.svelte';
import { client } from '../api';
import { SITE_URL } from '$lib/data/constants';

type inputProps = {
	new_user: Partial<profile>;
	old: Partial<profile>;
};

/* export async function checkUsername(username: string) {
	const contains = await supabase
		.from('profiles')
		.select('username')
		.eq('username', username)
		.maybeSingle();
	if (contains.error) {
		throw contains.error;
	}
	if (contains.data) {
		throw UsernameExistsError;
	}
	return true;
}
 */
export async function updateUser({ new_user, old }: inputProps) {
	// remove the field that wasn't changed !
	const new_data = old ? disjoint(new_user, old) : new_user;
	const uid = await getUserIDFromLocalStorage();
	if (!uid) {
		throw loginError;
	}
	removeNil(new_data);
	console.table({ new_data });
	new_data.user_modified_at = new Date().toUTCString();
	if (Object.keys(new_data).length > 0) {
		const data = await client.rest.api.self.protected.profile.$post({
			json: new_data
		});
		return responseUnwrap(data);
	}
	// don't have to update
	return null;
}

export function useUpdateUserInfo() {
	// const toast = useToast();
	return createMutation(() => { return {
		mutationFn: updateUser,
		onSuccess: (t) => {
			if (t) {
				console.log('update user locally ', t);
				Object.assign(user, t);
			}
			//  toast({ title: "updated your profile" });
		},
		meta: {
			toast: true,
			toastContent: 'Profile changed!'
		}
	} });
}

// email and password
export function useUpdateAuthCredential() {
	// const toast = useToast();
	const client = useQueryClient();
	return createMutation(() => { return {
		mutationFn: async ({
			email,
			password,
			redirectTo
		}: {
			email?: string;
			password?: string;
			redirectTo?: string;
		}) => {
			const r = await supabase.auth.updateUser(
				{
					password: password,
					email: email
				},
				{ emailRedirectTo: redirectTo ?? SITE_URL }
			);
			//console.log('updateUser ', r);
			if (r.error) throw r.error;
			return;
		},
		onSuccess: () => {
			//client.invalidateQueries();
		},
		meta: {
			toast: true,
			toastContent: 'Credential Updated!'
		}
	} });
}
export function useVerifyOTP() {
	return createMutation(() => { return {
		mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
			const data = await supabase.auth.verifyOtp({
				email: email,
				token: otp,
				type: 'recovery'
			});
			console.log('verity otp result', data);
			if (data.error) throw data.error;
		}
	} });
}
