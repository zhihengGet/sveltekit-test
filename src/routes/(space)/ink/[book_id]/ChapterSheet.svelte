<script lang="ts">
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import Sheet from '$components/Sheet.svelte';
	import Button from '$components/button.svelte';
	import { chapter_status, statusToActions } from '$lib/data/dbConstants';
	import { useGetAllChapters } from '$lib/queries';
	import { groupBy } from 'lodash-es';
	import ChapterListAccord from './ChapterList.svelte';
	import { InkStore } from '../../store.svelte';
	const chapters = useGetAllChapters({
		id: InkStore.book!.id
	});

	const grouped = $derived(groupBy(chapters.data, (v) => v.status));

	const chapter_count_infos = $derived.by(() => {
		let count: { [s in chapter_status]: number } = {};
		for (let x in grouped) {
			let sum = 0;
			for (let c of grouped[x]) {
				sum += c.word_count || 0;
			}
			count[x] = sum;
		}
		return count;
	});
</script>

<Sheet
	bind:open={InkStore.openChapterSheet}
	desc="Pick a chapter to edit and remember only published chapters are open to public"
	title="Chapters"
	closeOnOutsideClick={false}
>
	<!-- <Input placeholder="Search for a chapter" />
	<div class="break-words">
		<Input placeholder="Chapter" />
		<Input placeholder="Sequence" />
	</div> -->

	<QueryLoaderRunes CreateQueryResult={chapters}>
		<ChapterListAccord data={grouped} />
	</QueryLoaderRunes>
	<div class="flex gap-2 mt-5">
		<Button
			onclick={() => {
				InkStore.openCreateDialog = true;
			}}
		>
			New Chapter
		</Button>
		<Button onclick={() => (InkStore.openChapterSheet = false)}>Close</Button>
	</div>
	<!-- {#if chapter_infos}
		<div class="grid grid-cols-1">
			<div>Published Word Count:{chapter_infos.word_count}</div>
			<div>Published Character Count:{chapter_infos.character_count}</div>
			<div></div>
		</div>
	{/if} -->
</Sheet>
