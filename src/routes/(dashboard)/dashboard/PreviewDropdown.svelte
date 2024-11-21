<script lang="ts">
	import Button from '$components/button.svelte';
	import PreviewUrlList from '$components/PreviewURLList.svelte';
	let {
		book_id,
		chapter,
		selectedPreview = $bindable(),
		book,
		Search,
		text
	}: {
		book_id: number;
		text: string;
		selectedPreview: previews;
		book?: book;
		Search: Snippet;
		chapter?: min_chapter;
	} = $props();
	import * as Popover from '$lib/components/ui/popover/index.js';
	import BookSelect from '$lib/composite/BookSelect.svelte';
	import type { book, min_chapter, previews } from '$lib/types';
	import { formatNumber } from '$lib/utils';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { dashboardBookStore } from './BookStore.svelte';
	import type { Snippet } from 'svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button variant="outline" role="combobox" class="w-fit justify-between">
			{selectedPreview?.name ??
				text ??
				'Select a preview url for full-read access'}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-500px p-1">
		{@render Search?.()}
		<h1 class="font-medium leading-relaxed my-4">Previews</h1>
		<PreviewUrlList
			showDeleteButton={false}
			{book_id}
			chapter_id={chapter?.id ?? undefined}
		>
			{#snippet render(data)}
				<div class="flex my-2">
					<div class="grow-1 truncate">
						<input
							type="checkbox"
							checked={selectedPreview?.id === data.id}
							oninput={() => {
								selectedPreview = data;
							}}
						/>
						{data.name ?? 'Unknown'}
					</div>
					<div class="w-1/5 text-center">
						Expire In {timeAgo(new Date().getTime() + 3600 * 1000 * data.ttl)}
					</div>
				</div>
			{/snippet}
		</PreviewUrlList>
	</Popover.Content>
</Popover.Root>
