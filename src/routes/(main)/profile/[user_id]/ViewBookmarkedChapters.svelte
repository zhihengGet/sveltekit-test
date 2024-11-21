<script lang="ts">
	import Sheet from '$components/Sheet.svelte';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left'
import ChevronRight from 'lucide-svelte/icons/chevron-right';

	import type { paginateQuery, comment, min_chapter } from '$lib/types';

	import PaginateUi from '$components/PaginateUI.svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import {
		useGetBookmarkChapters,
		useGetBookmarkChaptersCount
	} from '$lib/queries/chapter/bookmark';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Input from '$components/ui/input/input.svelte';
	let { open = $bindable(false) } = $props<{ open: boolean }>();

	let pager: SvelteComponent<PaginateUi<min_chapter>> = $state({
		pageStore: { search: { regex: '' } }
	});
	let Search = $derived(pager?.RegexSearch);
</script>

<Sheet bind:open title="Bookmarks" desc="">
	<span>Count:{pager?.totalQueryCountInt}</span>

	<Input oninput={(e) => pager?.deb(e?.target?.value)} class="mb-2" />
	<!-- {#if Search}
		{@render Search()}
	{/if} -->
	<PaginateUi
		paginate={{
			orderWithMultiple: { updated_at: { asc: false } },
			start: 0,
			end: 6,
			size: 6
		}}
		showCount={false}
		useCountQuery={useGetBookmarkChaptersCount}
		useQuery={useGetBookmarkChapters}
		bind:this={pager}
	>
		{#snippet Render(data)}
			<div>
				{#each data ?? [] as item}
					{@const chapter = item.chapters}
					<div class="bg-magnum-300 px-2">
						<span>
							<a
								href="/reader/{item.chapters.book_id}/{item.chapters.id}"
								class=" text-lg truncate hover:text-red-400 font-mono"
							>
								{item.books?.title}
							</a>
							<a
								href="/reader/{chapter.book_id}/{chapter.id}"
								target="_blank"
								class="text-gray-500 text-sm block truncate hover:text-red-400"
							>
								{chapter.title}
							</a>
							<Textarea readonly disabled value={item.bookmark_notes} />
						</span>
					</div>
				{/each}
			</div>
		{/snippet}
	</PaginateUi>
</Sheet>
