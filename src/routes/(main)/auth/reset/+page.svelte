<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$components/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import { useUpdateAuthCredential } from '$lib/queries';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { supabase } from '$lib/supabaseClient/client';
	import { checkPassword } from '$lib/utils/passwordcheck';
	import { onMount } from 'svelte';

	let isReady = $state(true);
	let newPassword = $state('');
	let newPassword1 = $state('');
	let text = $state('');
	let error = $derived(checkPassword(newPassword));
	const updateCred = useUpdateAuthCredential();
	let hasError = $state(false);
	$effect(() => {
		AuthDialog.setOpen(false);
	});
	onMount(() => {
		// will handle token verity on redirect
		supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('receiving events in reset', event, session);
			if (event == 'PASSWORD_RECOVERY') {
				// token verifies, can proceed with reset flow
				isReady = false;
			}
		});
	});
	//http://127.0.0.1:5173/auth/reset?error=unauthorized_client&error_code=401&error_description=Email+link+is+invalid+or+has+expired#error=unauthorized_client&error_code=401&error_description=Email+link+is+invalid+or+has+expired
	let errMsg = $state('');
	$effect(() => {
		return page.subscribe((v) => {
			const url = v.url;
			const err = url.searchParams.get('error_description');
			if (err) {
				errMsg = err;
				hasError = true;
			}
		});
	});
</script>

<main class="w-screen h-screen flex-col items-center justify-center flex">
	<h1 class="text-[2em]">{errMsg}🫢</h1>
	<form
		class="s w-600px grid grid-cols-1 gap-2 items-center p-5"
		class:hidden={errMsg.length != 0}
	>
		<div class="flex justify-center space-x-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-12 w-12 text-gray-500"
			>
				<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
			</svg>
			<h1 class="text-2xl font-bold">Reset Password</h1>
		</div>

		<label class="col-span-1 capitalize" for="ps">new password</label>
		<Input
			autocomplete="off"
			list="autocompleteOff"
			id="ps1"
			type="password"
			aria-autocomplete="none"
			placeholder="min length 8"
			minlength={8}
			maxlength={15}
			class=""
			bind:value={newPassword}
		/>
		<label for="ps2 text-sm capitalize">Reenter new password</label>
		<Input
			autocomplete="off"
			list="autocompleteOff"
			aria-autocomplete="none"
			class=""
			minlength={8}
			maxlength={15}
			id="ps2"
			type="password"
			bind:value={newPassword1}
		/>
		<meter
			class="hidden"
			max="4"
			id="password-strength-meter"
			low="3"
			high="4"
			optimum="3"
			min="0"
			value={error.score}
		></meter>

		<h2 id="password-strength-text text-blue">Hint</h2>
		<ol class="list-circle list-inside text-yellow-600">
			{#each error.suggestions as t}
				<li>{t}</li>
			{/each}
		</ol>
		{error.suggestions.length == 0 ? 'Nice' : ''}
		<Button
			disabled={isReady == false || hasError || error.isValid === false}
			onclick={() => {
				updateCred.mutate(
					{ password: newPassword1 },
					{
						onSuccess: () => {
							text = 'navigating to home page in 3 seconds...';
							setTimeout(() => {
								goto('/');
							}, 3000);
						}
					}
				);
			}}
		>
			{text || 'Reset'}
		</Button>
	</form>
</main>

<style>
	.s {
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	}
</style>
