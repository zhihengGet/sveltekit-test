<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import Button from '$components/button.svelte';
	import { getPublicArtworkUrlSync } from '$lib/queries/storage/ObjectKey';
	import { useDeleteArtwork } from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import type { book } from '$lib/types';
	import type { Snippet } from 'svelte';
	import ArtworkForm from '../../routes/(main)/profile/ArtworkCreateForm.svelte';
	let {
		onClick,
		children,
		buttonText,
		selectedBook,
		showBookSelector
	}: {
		onClick?: () => {};
		buttonText?: string;
		children?: Snippet;
		selectedBook?: book;
		showBookSelector?: boolean;
	} = $props();

	let isSelf = $derived(user.authStatus === 'signed in');
	let open = $state(false);
</script>

{#if isSelf}
	<Drawer
		bind:open
		title="Create Artworks"
		class="max-h-4/6"
		description="You can upload 200 artworks!Will likely increase in the future."
	>
		<div class="overflow-auto p-2 md:p-1">
			<ArtworkForm {selectedBook} {showBookSelector} />
		</div>
	</Drawer>
	<Button
		class="my-2 underline "
		variant="ghost"
		onclick={() => {
			onClick?.();
			open = true;
		}}
	>
		{@render children?.()}
		{#if !children}
			{buttonText ? buttonText : '+ Art'}
		{/if}
	</Button>
{/if}
