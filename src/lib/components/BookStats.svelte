<script lang="ts">
	import IconStats from '$lib/components/IconStats.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import Like from '$lib/icons/like.svelte';
	import type { book } from '$lib/types';
	import FlameIcon from 'lucide-svelte/icons/flame';
	import Staricon from '../icons/StarIcon.svelte';
	import Tooltip from './Tooltip.svelte';
	export let book: book;
</script>

<span class="flex gap-2 h-[29px] items-center overflow-clip">
	<Tooltip
		text="average rating"
		class="h-fit flex items-end w-fit inline m-0 p-0"
	>
		{#snippet trigger({ props })}
			<span class="h-fit flex items-end w-fit inline m-0 p-0" {...props}>
				<IconStats count={book?.average_rating ?? 0}>
					<Staricon type="star" />
					<!-- 	<span slot="stats">{book?.average_rating}</span> -->
				</IconStats>
			</span>
		{/snippet}
	</Tooltip>

	<IconStats count={book?.like_count}>
		<Like />
	</IconStats>

	<IconStats count={book?.dislike_count}>
		<Dislike />
	</IconStats>

	<IconStats count={book.total_click}>
		<FlameIcon size={18} class="text-yellow" />
	</IconStats>
	<!-- 	<IconStats count={book.character_count}>📄</IconStats> -->
</span>
