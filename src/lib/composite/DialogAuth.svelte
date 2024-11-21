<script>
	import Dialog from '$components/dialog.svelte';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { user } from '$lib/state/runes.svelte';
	import Auth from './auth.svelte';
	import OAuth from './OAuth.svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { dev } from '$app/environment';
	let isSignUp = $state(false);
	let forbid = ['/book', '/reader', '/term', '/privacy_notice'];
	let allow = ['/dashboard', '/ink', '/chat'];

	afterNavigate(() => {
		return page.subscribe((v) => {
			const name = v.url.pathname;
			if (
				user.authStatus != 'signed in' &&
				allow.map((v) => name.includes(v)).includes(true)
			) {
				AuthDialog.setOpen(true);
			} else {
				AuthDialog.setOpen(false);
			}
		});
	});
</script>

<Dialog
	bind:open={AuthDialog.open}
	title={isSignUp == false
		? 'Welcome To ForkRead!'
		: 'Welcome ! Please Sign Up'}
	class="w-330px md:w-350px h-fit "
>
	<div class="overflow-x-hidden">
		{#if dev}
			<Auth bind:isSignUp />
		{/if}
		{#if !dev}
			<OAuth bind:isSignUp />
		{/if}
		<div class="auth"></div>
	</div>
</Dialog>

<style>
	/* 	.auth {
		background: rgb(255, 255, 255);
		background: linear-gradient(
			138deg,
			rgba(255, 255, 255, 1) 0%,
			rgba(241, 255, 182, 0.6250875350140056) 67%,
			rgba(255, 255, 255, 0) 100%
		);
	} */
	.auth {
		top: 0%;
		width: 100%;
		z-index: -1;
		height: 100%;
		left: 0;
		position: absolute;

		clip: circle(74% at 68% 32%);
	}
</style>
