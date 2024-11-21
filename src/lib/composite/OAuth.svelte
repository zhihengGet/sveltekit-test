<script lang="ts">
	import Text from '$components/text.svelte';
	import { Button } from '$components';
	import { Input } from '$lib/components/ui/input';
	import useSignIn from '$lib/queries/user/signin';
	import useSignUp from '$lib/queries/user/signup';
	import { enhance } from '$app/forms';
	import { useUpdateAuthCredential } from '$lib/queries/user';
	import { checkPassword } from '$lib/utils/passwordcheck';
	import { AuthDialog } from '$lib/state/login.svelte';
	import BackArrow from '$lib/icons/arrow/BackArrow.svelte';
	import Turnstile from './Turnstile.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import queryClient from '$lib/queries/client';
	import { supabase } from '$lib/supabaseClient/client';
	import { GET_URL } from '$lib/data/constants';
	import { createMutation } from '@tanstack/svelte-query';
	import { dev } from '$app/environment';
	import MailOpenIcon from 'lucide-svelte/icons/mail-open';
	import { invalidateAll } from '$app/navigation';
	import type { EmailOtpType } from '@supabase/supabase-js';
	import GoogleLogin from './auth/GoogleLogin.svelte';
	import SocialAuth from './auth/SocialAuth.svelte';
	type events = [
		'signUp',
		'signIn',
		'onForgotPassword',
		'enterOTP',
		'changePassword',
		'MagicLink'
	];
	type event = events[number];
	let email: string = $state(dev ? 'zhihengzhanga@gmail.com' : '');
	let password: string = $state(dev ? 'test123' : '');
	let passwordReenter: string = $state('');
	let otp: string = $state('');
	let msg = $state('');
	let captcha = $state('');

	let { isSignUp = $bindable(false) }: { isSignUp: boolean } = $props();
	let mode = $state<event>('MagicLink');
	let modes = $state<event[]>(['MagicLink']);
	/* 
	reset password flow :  send reset email, verity otp, updateUser
	*/
	const sendReset = createMutation(() => {
		return {
			mutationFn: async () => {
				const data = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: GET_URL() + '/auth/reset',
					captchaToken: captcha
				});
				if (!data.error) {
					msg =
						'Reset email was sent to your inbox! Please enter your OTP or click on the link in the email';
					mode = 'enterOTP';
					modes.push('enterOTP');
				} else if (data.error) {
					msg = 'Please try again later! ' + data.error.message;
					turnstile.gen();
					throw data.error;
				}
			}
		};
	});
	const verifyOTP = createMutation(() => {
		return {
			mutationFn: async (type: EmailOtpType) => {
				const data = await supabase.auth.verifyOtp({
					email: email,
					token: otp,
					type: type ?? 'recovery',
					options: {
						captchaToken: captcha,
						redirectTo: GET_URL() + '/auth/reset'
					}
				});
				/* if (!data.error) {
				msg =
					'Reset email was sent to your inbox! Pleas enter your OTP or click on the link in the email';
				mode = 'enterOTP';
				return;
			} */
				if (data.error) {
					turnstile.gen();
					throw data.error;
				}
			}
		};
	});

	const MagicLinkFn = createMutation(() => {
		return {
			mutationFn: async () => {
				const data = await supabase.auth.signInWithOtp({
					email: inputParams.email || email,
					options: {
						captchaToken: captcha
					}
				});
				if (data.error) {
					turnstile.gen();
					throw data.error;
				}
			}
		};
	});
	async function handleSignInWithGoogle(response) {
		const { data, error } = await supabase.auth.signInWithIdToken({
			provider: 'google',
			token: response.credential
		});
		if (error) {
			msg = error.message;
			throw error;
		}
	}
	//google's prebuilt ui
	const OauthLoginGoogle = createMutation(() => {
		return {
			mutationFn: handleSignInWithGoogle
		};
	});

	const submit: SubmitFunction = async ({
		formData,
		cancel,
		formElement,
		submitter
	}) => {
		/* 	email = inputParams.email;
		password = inputParams.password;
		passwordReenter = inputParams.password_reenter; */
		const id = submitter?.id as event;
		if (mode == 'MagicLink') {
			MagicLinkFn.mutate(undefined, {
				onSuccess: () => {
					msg =
						'Magic Link sent successfully,Please follow the instructions in the email !';
					mode = 'enterOTP';
					modes.push('enterOTP');
				},
				onError: (error) => {
					msg = error.message;
				}
			});
			cancel();
			return;
		}
		if (mode == 'enterOTP') {
			// verify OTP when reset password
			verifyOTP.mutate(modes.includes('MagicLink') ? 'magiclink' : 'recovery', {
				onSuccess: () => {
					inputParams.password = '';
					inputParams.password_reenter = '';
					msg = 'OTP successfully validated ! Please enter your new password';
					mode = 'changePassword';
					modes.push('changePassword');
					invalidateAll();
					if (modes.includes('MagicLink')) {
						//logged in
						AuthDialog.open = false;
					}
				},
				onError: (e) => {
					msg = e.message;
				}
			});

			cancel(); // don't submit since SPA
			return;
		}
		console.log('email', email, password, inputParams);

		cancel();
	};

	let turnstile: Turnstile = $state();
	let inputParams: {
		password: string;
		email: string;
		password_reenter: string;
	} = $state({
		password: '',
		email: ''
	});

	$effect(() => {
		email = inputParams.email;
		password = inputParams.password;
		passwordReenter = inputParams.password_reenter;
	});
</script>

<form
	method="POST"
	use:enhance={submit}
	class="flex flex-col justify-center gap-2 px-1"
>
	<!-- Email -->
	<Text class="text-red">{msg}</Text>
	<label for="email">Email</label>

	<Input
		id="email"
		autocomplete="off"
		list="autocompleteOff"
		aria-autocomplete="none"
		name="email"
		type="email"
		bind:value={email}
		required
		minlength={8}
	/>

	<!-- OTP form -->
	<!-- used for password reset or login -->
	<label for="otp" class:hidden={mode !== 'enterOTP'}>One Time Password</label>
	<Input
		id="otp"
		type={mode !== 'enterOTP' ? 'hidden' : 'text'}
		name="OTP"
		placeholder="Please Enter One Time Password"
		bind:value={otp}
		required
		min={8}
	/>

	<Turnstile bind:token={captcha} bind:this={turnstile} />

	<span data-id="submit_buttons">
		<Button
			variant="default"
			class={mode !== 'enterOTP' ? 'hidden' : ''}
			isLoading={verifyOTP.isPending}
			type="submit"
		>
			Submit OTP
		</Button>
		<Button
			variant="default"
			class={mode !== 'MagicLink'
				? 'hidden'
				: 'bg-gradient-to-r from-sky-500 to-indigo-500'}
			isLoading={MagicLinkFn.isPending}
			type="submit"
			disabled={!captcha}
		>
			Send Magic Link
		</Button>
	</span>
</form>

<div class="flex items-center justify-center">
	<hr class="w-1/3 border-t-neutral border-t-2" />
	<span class="mx-2">OR</span>
	<hr class="w-1/3 border-t-neutral border-t-2" />
</div>

<div class="my-1 border-1 rounded-full bg-gray-100 flex justify-evenly">
	<SocialAuth
		onClick={() => {
			mode = 'MagicLink';
			modes = ['MagicLink'];
		}}
		icon={MailOpenIcon}
	/>

	<GoogleLogin
		type="icon"
		cb={(A) => {
			OauthLoginGoogle.mutate(A, {
				onSuccess: async () => {
					await invalidateAll();
					AuthDialog.open = false;
				}
			});
		}}
	/>
</div>

<div class="mx-auto inline-block w-fit text-sm rounded-2xl p-2">
	By signing up, you agree to our
	<div class="mt-2">
		<a class="text-sm text-gray" href="/term">Term Of Conditions</a>

		<a class="text-sm text-gray" href="/privacy_notice">| Privacy Notice</a>
	</div>
</div>
