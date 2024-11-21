import { toastNotify } from '$lib/utils/toast';
import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createMutation as createMutation } from '@tanstack/svelte-query';
import type { CustomError } from '../base/errors';

export default function useResetCredential() {
	async function t(email: string) {
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: window.location.origin + '/resetkey?'
		});
		if (error) throw error;
		return data;
	}

	return createMutation(() => { return {
		mutationFn: t,
		onSuccess: () => {
			toastNotify.success('email sent ! check your mailbox!');
		},
		onError: (e: CustomError) => {
			toastNotify.error('failed !' + e.message);
		}
	} });
}
