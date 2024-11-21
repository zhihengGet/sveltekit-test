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
	import { supabase } from '$lib/supabaseClient/client';
	import { GET_URL } from '$lib/data/constants';
	import { createMutation } from '@tanstack/svelte-query';
	import { dev } from '$app/environment';
	import MailOpenIcon from 'lucide-svelte/icons/mail-open';
	import LockKeyhole from 'lucide-svelte/icons/lock-keyhole';
	import { invalidateAll } from '$app/navigation';
	import type { EmailOtpType } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import GoogleLogin from './auth/GoogleLogin.svelte';
	import SocialAuth from './auth/SocialAuth.svelte';
	type detail = { isSuccess: boolean; message: string };
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
	let cf = $state();
	const signup = useSignUp();
	const handleSignUp = () =>
		signup.mutate(
			{ email, password, options: { captchaToken: captcha } },
			{
				onSuccess: () => {
					msg =
						'Please confirm your email by checking your inbox(spam folder) !';
					turnstile.gen();
				},
				onError: () => {
					turnstile.gen();
				}
			}
		);

	const handleSignIn = useSignIn();

	let { isSignUp = $bindable(false) }: { isSignUp: boolean } = $props();
	let mode = $state<event>(isSignUp ? 'signUp' : 'signIn');
	let modes = $state<event[]>(['signIn']);
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
				turnstile.gen();
				if (data.error) throw data.error;
			}
		};
	});
	// without oauth prebuilt ui, using our own
	const OauthLogin = createMutation(() => {
		return {
			mutationFn: async () => {
				await supabase.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: GET_URL() + `/auth/callback`
					}
				});
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
		if (mode == 'onForgotPassword') {
			const data = await sendReset.mutateAsync();
			cancel();
			return;
		} else if (mode == 'enterOTP') {
			// verify OTP when reset password
			verifyOTP.mutate(modes.includes('MagicLink') ? 'magiclink' : 'recovery', {
				onSuccess: () => {
					inputParams.password = '';
					inputParams.password_reenter = '';
					msg = 'OTP successfully validated ! Please enter your new password';
					mode = 'changePassword';
					modes.push('changePassword');
					invalidateAll();
				},
				onError: (e) => {
					msg = e.message;
				}
			});
			if (modes.includes('MagicLink')) {
				//logged in
				AuthDialog.open = false;
			}
			cancel(); // don't submit since SPA
			return;
		} else if (mode == 'changePassword') {
			updateCred.mutate(
				{ email, password: passwordReenter },
				{
					onSuccess: () => {
						AuthDialog.toggleOpen();
					},
					onError: (E) => {
						msg = E.message;
					}
				}
			);
			cancel();
			return;
		}
		console.log('email', email, password, inputParams);

		const f =
			mode == 'signUp'
				? handleSignUp
				: () =>
						handleSignIn.mutate(
							{ email, password, options: { captchaToken: captcha } },
							{
								onSuccess: () => {
									//	dispatch('signIn', { isSuccess: true, message: '' });
									AuthDialog.toggleOpen();
									invalidateAll();
									//window.location.reload();
									//	queryClient.invalidateQueries();
								},
								onError: (e) => {
									/* 	dispatch(
										'signIn',
										{ isSuccess: false, message: e.message },
										{ cancelable: true }
									); */
									turnstile.gen();
									return;
								}
							}
						);
		f();
		cancel();
	};

	let showPassword = $derived(
		mode == 'signIn' || mode == 'signUp' || mode == 'changePassword'
	);

	let psCheck = $derived(checkPassword(password));
	const updateCred = useUpdateAuthCredential();
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
	let last_text = $derived(
		modes.at(-1) === 'signIn'
			? 'Sign In'
			: modes.at(-1) === 'MagicLink'
				? 'Login with email'
				: modes.at(-1) === 'onForgotPassword'
					? 'Send Reset Email'
					: modes.at(-1) === 'enterOTP'
						? 'Verify OTP'
						: modes.at(-1) === 'changePassword'
							? 'Update Password'
							: mode === 'signUp'
								? 'Sign Up'
								: ''
	);
	onMount(() => {
		/* 	document.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				
			}
		}); */
	});
</script>

{#snippet EmailInput()}
	{@render InputLabel({ type: 'email', id: 'email' })}
{/snippet}
{#snippet PasswordInput({ id, label })}
	{@render InputLabel({ id, label, type: 'password', min: 8, required: true })}
{/snippet}
{#snippet PasswordStrength()}
	<ol
		class="list-circle list-inside text-yellow-600"
		class:hidden={mode == 'signIn' || !showPassword}
	>
		{#each psCheck.suggestions as t}
			<li>{t}</li>
		{/each}
	</ol>
{/snippet}

{#snippet InputLabel({ id, label, type, ...props })}
	<label class="capitalize" for={id}>{label ?? id}</label>
	<Input
		{id}
		{type}
		name={label}
		bind:value={inputParams[id]}
		required
		{...props}
	/>
{/snippet}

{#snippet options()}
	<span class="bg-gradient-conic">
		<button
			class="text-sm hover:(underline text-blue ) cursor-pointer px-0 font-600"
			type="button"
			onclick={() => {
				msg = '';
				isSignUp = !isSignUp;
				if (mode == 'signUp') {
					mode = 'signIn';
				} else {
					mode = 'signUp';
				}
				modes = [mode];
				//	dispatch('action', isSignUp);
			}}
			disabled={signup.isPending || handleSignIn.isPending}
		>
			{mode != 'signUp' ? 'Does Not Have An Account?' : 'Already Have Account?'}
		</button>

		{#if isSignUp == false && mode == 'signIn'}
			<button
				type="button"
				onclick={() => {
					msg = '';
					mode === 'onForgotPassword'
						? (mode = 'signIn')
						: (mode = 'onForgotPassword');

					modes = [mode];
				}}
				class="text-sm block hover:(underline text-blue ) cursor-pointer px-0"
			>
				Forgot you password ?
			</button>
		{/if}
	</span>
{/snippet}

{#if false}
	<form
		method="POST"
		use:enhance={submit}
		class="flex flex-col justify-center gap-2 px-1"
	>
		<Text class="text-red">{msg}</Text>
		{#if mode == 'changePassword' || mode == 'enterOTP'}
			<button
				type="button"
				onclick={() => {
					if (
						modes.length > 1 ||
						mode == 'changePassword' ||
						mode == 'enterOTP'
					) {
						if (modes.length > 1 && modes[0]) {
							msg = '';
							modes = [modes[0]];
							mode = modes.at(-1) as event;
							turnstile.gen();
						}
					}
				}}
			>
				<BackArrow />
			</button>
		{/if}
		<!-- 	<pre class="text-wrap break-all">{JSON.stringify(inputParams)}</pre>
	{JSON.stringify(modes)} -->
		{#if modes.includes('signIn')}
			{@render InputLabel({ type: 'email', id: 'email', label: 'Email' })}
			{@render PasswordInput({ id: 'password' })}
		{/if}
		{#if modes.includes('signUp')}
			{@render InputLabel({ type: 'email', id: 'email' })}
			{@render PasswordInput({ id: 'password', label: 'Password' })}
			{@render PasswordInput({
				id: 'password_reenter',
				label: 'password_reenter'
			})}
			<ol
				class="list-circle list-inside text-yellow-600"
				class:hidden={mode == 'signIn' || !showPassword}
			>
				{#each psCheck.suggestions as t}
					<li>{t}</li>
				{/each}
			</ol>
		{/if}
		{#if modes.includes('MagicLink')}
			{@render EmailInput()}
			{#if modes.includes('enterOTP')}
				<label for="otp">One Time Password</label>
				<Input
					id="otp"
					type={mode !== 'enterOTP' ? 'hidden' : 'text'}
					name="OTP"
					placeholder="Please Enter One Time Password"
					bind:value={otp}
					required
					min={8}
				/>
			{/if}
		{/if}
		{#if modes.includes('onForgotPassword')}
			{@render EmailInput()}
			{#if mode === 'enterOTP'}
				<label for="otp">One Time Password</label>
				<Input
					id="otp"
					type={mode !== 'enterOTP' ? 'hidden' : 'text'}
					name="OTP"
					placeholder="Please Enter One Time Password"
					bind:value={otp}
					required
					min={8}
				/>
			{/if}
			{#if modes.includes('changePassword')}
				{@render PasswordInput({ id: 'password' })}
				{@render PasswordInput({
					id: 'password_reenter',
					label: 'Enter Password Again'
				})}
				<ol
					class="list-circle list-inside text-yellow-600"
					class:hidden={mode == 'signIn' || !showPassword}
				>
					{#each psCheck.suggestions as t}
						<li>{t}</li>
					{/each}
				</ol>
			{/if}
		{/if}
		<Turnstile bind:token={captcha} bind:this={turnstile} />
		<Button
			type="submit"
			isLoading={handleSignIn.isPending ||
				!captcha ||
				sendReset.isPending ||
				verifyOTP.isPending ||
				OauthLogin.isPending ||
				OauthLoginGoogle.isPending ||
				signup.isPending ||
				handleSignIn.isPending}
			disabled={!psCheck.isValid &&
				(mode == 'changePassword' || mode == 'signUp')}
		>
			{last_text}
			{!psCheck.isValid && (mode == 'changePassword' || mode == 'signUp')
				? '(Password too weak)'
				: ''}
		</Button>
		<!-- options  -->
		<span class="bg-gradient-conic bg-gray-100 rounded-2xl p-2">
			<Button
				class="text-sm hover:(underline text-blue ) cursor-pointer px-0"
				variant="ghost"
				size="sm"
				type="button"
				onclick={() => {
					msg = '';
					isSignUp = !isSignUp;
					if (mode == 'signUp') {
						mode = 'signIn';
					} else {
						mode = 'signUp';
					}
					modes = [mode];
					//	dispatch('action', isSignUp);
				}}
				disabled={signup.isPending || handleSignIn.isPending}
			>
				{mode != 'signUp'
					? 'Does Not Have An Account?'
					: 'Already Have Account?'}
			</Button>

			{#if isSignUp == false && mode == 'signIn'}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={() => {
						msg = '';
						mode === 'onForgotPassword'
							? (mode = 'signIn')
							: (mode = 'onForgotPassword');

						modes = [mode];
					}}
					class="text-sm block hover:(underline text-blue ) cursor-pointer px-0"
				>
					Forgot you password ?
				</Button>
			{/if}
		</span>
	</form>
{/if}
{#if true}
	<form
		method="POST"
		use:enhance={submit}
		class="flex flex-col justify-center gap-2 px-1"
	>
		{#if modes.length > 1}
			<button
				type="button"
				onclick={() => {
					if (modes.length > 0) {
						mode = modes[0];
						modes = [modes[0]];
						msg = '';
						turnstile.gen();
					}
				}}
			>
				<BackArrow />
			</button>
		{/if}
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

		<!-- Password form -->
		<label for="pass" class:hidden={!showPassword}>
			Password {psCheck.isValid ? '' : ''}
		</label>

		<Input
			id="pass"
			type={!showPassword ? 'hidden' : 'password'}
			name="password"
			bind:value={password}
			required
			autocomplete="off"
			min={8}
		/>

		<ol
			class="list-decimal pl-4 text-yellow-600"
			class:hidden={mode == 'signIn' || !showPassword}
		>
			{#if psCheck.isValid === false}
				<p class="text-red">Too weak !</p>
			{/if}
			{#each psCheck.suggestions as t}
				<li>{t}</li>
			{/each}
		</ol>
		<!-- Password form confirmation field for reset password -->
		<label for="pass1" class:hidden={mode !== 'changePassword'}>
			Reenter Password
		</label>
		<Input
			id="pass1"
			type={mode !== 'changePassword' ? 'hidden' : 'password'}
			name="password"
			autocomplete="off"
			bind:value={passwordReenter}
			required
			min={8}
		/>
		<!-- OTP form -->
		<!-- used for password reset or login -->
		<label for="otp" class:hidden={mode !== 'enterOTP'}>
			One Time Password
		</label>
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
		<!-- buttons -->
		{@render options()}
		<span data-id="submit_buttons  ">
			<Button
				class={mode == 'signUp' ? 'block w-full' : 'hidden'}
				isLoading={signup.isPending}
				type="submit"
				disabled={psCheck.isValid == false || captcha?.length <= 0}
			>
				Sign Up
			</Button>
			<Button
				variant="default"
				class={mode !== 'signIn' ? 'hidden  ' : 'w-full'}
				isLoading={handleSignIn.isPending || captcha?.length <= 0}
				type="submit"
			>
				Sign In
			</Button>
			<Button
				variant="default"
				class={mode !== 'onForgotPassword' ? 'hidden' : ''}
				isLoading={sendReset.isPending || captcha?.length <= 0}
				type="submit"
			>
				Send Reset Email
			</Button>
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
				class={mode !== 'changePassword' ? 'hidden' : ''}
				isLoading={updateCred.isPending}
				type="submit"
				disabled={psCheck.isValid == false}
			>
				Update Password
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
		<!-- options  -->
		<span class="bg-gradient-conic hidden">
			<Button
				class="text-sm hover:(underline text-blue ) cursor-pointer px-0"
				variant="ghost"
				size="sm"
				type="button"
				onclick={() => {
					msg = '';
					isSignUp = !isSignUp;
					if (mode == 'signUp') {
						mode = 'signIn';
					} else {
						mode = 'signUp';
					}
					modes = [mode];
					//	dispatch('action', isSignUp);
				}}
				disabled={signup.isPending || handleSignIn.isPending}
			>
				{mode != 'signUp'
					? 'Does Not Have An Account?'
					: 'Already Have Account?'}
			</Button>

			{#if isSignUp == false && mode == 'signIn'}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={() => {
						msg = '';
						mode === 'onForgotPassword'
							? (mode = 'signIn')
							: (mode = 'onForgotPassword');

						modes = [mode];
					}}
					class="text-sm block hover:(underline text-blue ) cursor-pointer px-0"
				>
					Forgot you password ?
				</Button>
			{/if}
		</span>
	</form>
{/if}

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

	<SocialAuth
		isEnabled={mode != 'signIn'}
		onClick={() => {
			mode = 'signIn';
			modes = ['signIn'];
		}}
		icon={LockKeyhole}
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
