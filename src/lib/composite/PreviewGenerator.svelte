<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import PreviewUrlList from '$components/PreviewURLList.svelte';
	import Button from '$components/button.svelte';
	import { Input } from '$components/ui/input';
	import { useCreatePreview } from '$lib/queries/preview/usePreview';
	import { user } from '$lib/state/runes.svelte';
	import type { book, chapter, min_chapter } from '$lib/types';
	import type { Snippet } from 'svelte';
	import BookSelect from './BookSelect.svelte';
	import { MAX_PREVIEW_DURATION } from '$lib/data/constants';
	let {
		open = $bindable(false),
		book_id,
		chapter_id,
		initBook,
		initChapter,
		triggerButton
	}: {
		book_id?: number;
		chapter_id?: number;
		open?: boolean;
		initChapter?: min_chapter | null;
		initBook?: book;
		triggerButton?: Snippet<[() => void]>;
	} = $props();

	const filter = $state({
		filter: { author_id: user.id },
		paginate: {
			page: 1,
			size: 0,
			start: 0,
			end: 1
		},
		search: { regex: '' }
	});
	const data = $state({ ttl: 1, description: '', name: '' });
	$effect(() => {
		//@ts-ignore
		filter.filter.book_id = book_id;
	});
	let selectedBook: book | undefined = $state(initBook);
	let selectedChapter: min_chapter | null | undefined = $state(initChapter);
	const create = useCreatePreview();
	const bid = $derived(selectedBook?.id);
	const cid = $derived(selectedChapter?.id);

	$effect(() => {
		selectedBook = initBook;
	});
	$effect(() => {
		selectedChapter = initChapter;
	});
	const showList = $derived(bid);
	//let openP = $state(false);
</script>

<!-- {@render triggerButton?.(toggle)} -->
<Drawer
	description="Create preview links for  chapters in *draft* status. Unpublished chapters are not public but often times you need beta readers to help you find bugs 🐛 !"
	title={'Preview URL Manager'}
	bind:open
>
	<div
		onsubmit={() => {
			if (bid)
				create.mutate({
					book_id: bid + '',
					chapter_id: cid ? cid + '' : undefined,
					...data,
					type: cid ? 'chapter' : 'book'
				});
		}}
		class="flex flex-col gap-3"
	>
		<label for="name">Name</label>
		<Input
			placeholder="max 100 char"
			required={true}
			maxlength={100}
			id="name"
			bind:value={data.name}
		/>
		<label for="duration">
			Duration in hours(max {MAX_PREVIEW_DURATION} hours)
		</label>
		<Input
			placeholder=""
			type="number"
			min="1"
			step="1"
			max={MAX_PREVIEW_DURATION}
			id="duration"
			bind:value={data.ttl}
			required={true}
		/>
		<label for="description">Description</label>
		<Input
			placeholder="max 100 char"
			maxlength={100}
			id="description"
			bind:value={data.description}
			required={true}
		/>

		<BookSelect
			filter={{ author_id: user.id }}
			bind:selectedBook
			bind:selectedChapter
			chapterFil={{ status: 'draft' }}
			authoredBook={true}
		/>

		<hr />
		{#if bid && showList}
			<h4>Preview URLs</h4>
			<PreviewUrlList book_id={bid} chapter_id={cid} />
		{/if}
		<Button
			disabled={!bid || !data.name || !data.description || !data.ttl}
			isLoading={create.isPending}
			class="text-sm block float-right"
			onclick={() => {
				if (bid)
					create.mutate({
						book_id: bid + '',
						chapter_id: cid ? cid + '' : undefined,
						...data,
						type: cid ? 'chapter' : 'book'
					});
			}}
		>
			Submit
		</Button>
	</div>
</Drawer>
