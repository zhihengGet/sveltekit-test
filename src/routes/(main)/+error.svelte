<script>
	import { page } from '$app/stores';
	import { headerControl } from '$lib/state/ui.svelte';
	import Error from './Error.svelte';
	import FourZeroFour from './FourZeroFour.svelte';
	headerControl.toggle();

	/* posthog.capture('error_page', {
		error: $page.error,
		status: $page.status,
		url: $page.url.href
	}); */
</script>

{#if $page.status === 404}
	<FourZeroFour title="404" description={$page.error?.message}></FourZeroFour>
{/if}
{#if $page.status !== 404}
	<Error>
		<div>{$page.error?.message}</div>
	</Error>
{/if}
