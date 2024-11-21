<script lang="ts">
	import { OvalSpinner } from '$lib/icons';
	import type { Settings } from 'lexical-svelte-runes/editor';

	let { ...props }: Partial<Settings> = $props();

	let EditorInstance = $state();
	let Editor = $state();
	$effect(() => {
		EditorInstance = import('./editor.svelte')
			.catch((e) => {
				console.error('Error loading lexical editor ', e);
			})
			.then((v) => {
				Editor = v.default;
			});
	});
</script>

{#if !EditorInstance}
	Loading...<OvalSpinner />
{/if}

{#if EditorInstance}
	{#await EditorInstance}
		<OvalSpinner />
	{/await}
	<Editor />
{/if}
