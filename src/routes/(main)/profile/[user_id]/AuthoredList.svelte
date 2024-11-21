<script lang="ts">
	import BookCard from '$components/bookCard.svelte';
	import Text from '$components/text.svelte';
	import { useGetPublicAuthoredBooksPaginate } from '$lib/queries';
	import PaginateUi from '$components/PaginateUI.svelte';
	import type { profile } from '$lib/types';
	let { data }: { data: { profile:  profile | null; publicProfile: profile } } =
		$props();

	//const folders = $derived(buckets?.data?.folders.concat(['default']));
</script>

<div class="grow-1 w-100px md:w-1/2 bg-green glass px-3">
	<Text
		el="h1"
		class="text-3xl font-bold inline flex items-end text-amber-900  pb-2"
	>
		Authored
	</Text>
	<PaginateUi
		useQuery={useGetPublicAuthoredBooksPaginate}
		showCount={false}
		filter={{ author_id: data.publicProfile?.id, is_visible: true }}
		paginate={{
			start: 0,
			size: 12,
			end: 12,
			orderWith: 'like_count'
		}}
	>
		{#snippet Render(data)}
			<div class="flex flex-nowrap overflow-auto">
				{#each typeof data === 'number' || !data ? [] : data as item}
					<BookCard book={item} type="simple2D" />
				{/each}
			</div>
		{/snippet}
	</PaginateUi>
</div>

<style>
	.glass {
		background: rgba(255, 255, 255, 0.8);
		box-shadow: 8px -7px 49px 4px rgba(195, 209, 186, 1);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.18);
	}
</style>
