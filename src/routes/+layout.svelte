<script lang="ts">
	import '@unocss/reset/tailwind-compat.css';
	//import 'uno.css';
	import '../styles.css';
	import { Toaster } from 'svelte-sonner';

	import { invalidate } from '$app/navigation';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import queryClient from '$lib/queries/client';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { session, profile } = $derived(data);

	//cssControl.mobile = data.isMobile; // initialize ssr
	onMount(() => {
		const {
			data: { subscription }
		} = supabaseClient.auth.onAuthStateChange(async (event, _session) => {
			console.log('session', event, _session, profile);
			if (event == 'SIGNED_IN') {
				if (_session && !profile) {
					console.error(
						'session exists but have not fetch profile;refetching...'
					);
					invalidate('supabase:auth');
				} else {
					console.log('Already have user profile', profile);
				}
				/* if (_session?.expires_at !== session?.expires_at) {
					// Session isn't up to date with ssr session ?
					// TODO probably remove this
					console.log('session invalid; expires_at date invalid !!!');
					invalidate('supabase:auth');
				} */
			}

			//TODO no longer need following to access user session ssr
			else if (event == 'SIGNED_OUT') {
				console.log('signed out');
				// delete cookies on sign out
				//invalidate('supabase:auth');
			} else if (_session?.expires_at !== session?.expires_at) {
				//	console.log('session invalid; expires_at date invalid !!!');
				//invalidate('supabase:auth');
			} else if (event == 'PASSWORD_RECOVERY') {
				invalidate('supabase:auth');
			}
			/*	if (event === 'SIGNED_OUT') {
				clearAuthCookie();
			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				saveSessionToCookie(_session);
			} */
			//console.log('before update', await supabaseClient.auth.getSession());
		});

		return () => subscription.unsubscribe();
	});
	import DialogAuth from '$lib/composite/DialogAuth.svelte';

	/* onNavigate((navigation) => {
		//@ts-ignore
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			//@ts-ignore
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	}); */
	import { navigating } from '$app/stores';
	import { supabaseClient } from '$lib/supabaseClient/client';
	import NavigationLoader from '$lib/icons/loader/NavigationLoader.svelte';
	import { browser } from '$app/environment';
	import { SITE_NAME } from '$lib/data/constants';
</script>

<svelte:head>
	<!-- font preload to avoid font flash -->
	<link
		rel="preload"
		href="/Inter.ttf"
		as="font"
		type="font/ttf"
		crossorigin="anonymous"
	/>
	<title>{SITE_NAME}</title>
	<meta name="ForkRead" content="Read,Publish,Create Anything" />
</svelte:head>

{#if browser && $navigating}
	<NavigationLoader />
{/if}

<Toaster closeButton richColors />

<!-- <Toaster closeButton /> -->
<QueryClientProvider client={queryClient}>
	<DialogAuth />
	{@render children()}
	<SvelteQueryDevtools styleNonce="" />
</QueryClientProvider>
