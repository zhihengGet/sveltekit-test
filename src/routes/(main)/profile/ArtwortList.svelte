<script lang="ts">
	import {
		useDeleteArtwork,
		useGetArtworks
	} from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import PaginateUI from '$lib/components/PaginateUI.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Input from '$components/ui/input/input.svelte';
	import ArtworkDialog from './ArtworkCreateForm.svelte';
	import { secondsToHours } from 'date-fns';
	import Button from '$components/button.svelte';
	import { supabase } from '$lib/supabaseClient/client';
	import type { artwork, artworkWithBook } from '$lib/types';
	import { getPublicArtworkUrlSync } from '$lib/queries/storage/ObjectKey';
	import ArtworkCard from '$components/ArtworkCard.svelte';
	import CreateArtworkButton from '$lib/composite/CreateArtworkButton.svelte';
	let {
		book_id,
		chapter_id,
		user_id,
		text = 'View'
	}: {
		book_id?: number;
		chapter_id?: number;
		user_id?: string;
		text?: string;
	} = $props();
	let isSelf = $derived(user.authStatus === 'signed in');

	let open = $state(false);

	let selectedImage: artworkWithBook | null = $state(null);
	const d = useDeleteArtwork();
	let preview_url: string = $derived(
		selectedImage ? getPublicArtworkUrlSync(selectedImage) : ''
	);
</script>

<PaginateUI
	useQuery={useGetArtworks}
	filter={{ user_id: user_id || user.id }}
	paginate={{ start: 0, end: 10, size: 10, orderWithMultiple: {} }}
>
	{#snippet Render(data)}
		<div class="flex flex-wrap items-center justify-center md:justify-start">
			{#each data as work}
				<ArtworkCard artwork={work} />
			{/each}
		</div>
	{/snippet}
</PaginateUI>
