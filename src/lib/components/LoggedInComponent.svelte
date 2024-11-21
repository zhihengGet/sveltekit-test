<script lang="ts">
	import { user } from '$lib/state/runes.svelte';
	import type { Snippet } from 'svelte';
	let { auth, anon }: { auth: Snippet; anon: Snippet } = $props();
</script>

{#if user.authStatus == 'signed in'}
	{@render auth()}
{:else}
	{@render anon()}
{/if}
