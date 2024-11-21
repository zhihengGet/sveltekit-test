<script lang="ts">
	import { page } from '$app/stores';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { user } from '$lib/state/runes.svelte';
	let text = $state('');
	/* $effect(() => {
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
	}); */
	//http://127.0.0.1:5173/auth/reset?error=unauthorized_client&error_code=401&error_description=Email+link+is+invalid+or+has+expired#error=unauthorized_client&error_code=401&error_description=Email+link+is+invalid+or+has+expired
	$effect(() => {
		return page.subscribe((v) => {
			const url = v.url;
			text =
				url.searchParams.get('description') ??
				url.searchParams.get('error_description') ??
				url.searchParams.get('text') ??
				url.searchParams.get('message') ??
				'Verified';
		});
	});
</script>

<main class="w-screen h-screen flex-col items-center justify-center flex">
	<h1 class="text-[2em] w-1/2 h-5em text-center capitalize">{text}</h1>
	<button
		class:hidden={user.authStatus === 'signed in'}
		onclick={() => AuthDialog.toggleOpen()}
	>
		Login Now
	</button>
</main>

<style>
	.s {
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	}
</style>
