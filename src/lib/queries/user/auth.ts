/*
import { DOMAIN_URL } from '$lib/data/constants';
import { createMutation } from '@tanstack/svelte-query';

export function useSendResetPassword() {
	return createMutation(() => { return {
		mutationFn: async () => {
			const data = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: DOMAIN_URL()+ '/auth/reset'
			});
			if (!data.error) {
				msg =
					'Reset email was sent to your inbox! Pleas enter your OTP or click on the link in the email';
				mode = 'enterOTP';
			}
		}
	} });
}
 */
