<script lang="ts">
	import PaginateUi from '$components/PaginateUI.svelte';
	import { Input } from '$components/ui/input';
	import DotLoader from '$lib/icons/loader/DotLoader.svelte';
	import {
		useGetBooks,
		useGetChaptersList,
		useGetAllAuthoredBooks
	} from '$lib/queries';
	import type { book, min_chapter, paginateQuery } from '$lib/types';
	// only lists public books
	let {
		filter = $bindable({}),
		onSelectBook,
		onSelectChapter,
		selectedBook = $bindable(),
		selectedChapter = $bindable(),
		chapterFil = {},
		showBookSelector = true,
		authoredBook
	}: {
		filter: paginateQuery<book>['filter'];
		filterChapter?: paginateQuery<book>['filter'];
		onSelectBook?: (book: book) => unknown;
		selectedBook?: book | null;
		selectedChapter?: min_chapter | null;
		searchChapter?: boolean;
		chapterFil?: Partial<min_chapter>;
		showBookSelector?: boolean;
		onSelectChapter?: (chapter: min_chapter) => unknown;
		books?: book[];
		authoredBook?: boolean;
	} = $props();

	const authored_books = authoredBook
		? useGetAllAuthoredBooks()
		: { data: null };
	let chapterFilter: { book_id: number | undefined; id?: number } = $state({
		book_id: undefined,
		...chapterFil
	});
	function resetChapter() {
		chapterFilter = {
			book_id: undefined,
			...chapterFil
		};
		selectedChapter = undefined;
	}
	let enableReset = $state(false);
	$effect(() => {
		const bid = selectedBook?.id;
		//	const cid = selectedChapter?.id;
		if (bid) chapterFilter.book_id = bid;
		//if (cid) chapterFilter.id = cid;
	});

	//@ts-expect-error
	let pager: PaginateUi<any, any, any> = $state();
	//@ts-expect-error
	let cpager: PaginateUi<any, any, any> = $state();

	let search: string = $state('');
	let filtered_books = $derived(
		authored_books.data?.filter(
			(v) =>
				v.is_visible &&
				(!search || v.title.toLowerCase().includes(search.toLowerCase()))
		) ?? []
	);
</script>

<h1 class="text-md">
	<b
		class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		Select Public Book:
	</b>
	<b class="underline">
		<button
			onclick={() => {
				selectedBook = undefined;
				selectedChapter = undefined;
			}}
		>
			{selectedBook?.title}
		</button>
	</b>
</h1>

{#if !selectedBook && showBookSelector}
	<div
		class="max-w-[400px] rounded-lg border shadow-md max-h-[300px] overflow-auto"
	>
		{#if pager?.queryResult?.isLoading}
			<DotLoader />
		{/if}
		{#if authoredBook}
			<Input
				class="m-1"
				placeholder="Type a book title to search..."
				bind:value={search}
			/>
			<ol
				class="max-w-full list-decimal list-inside truncate my-3px p-2 truncate"
			>
				{#each filtered_books as book (book.id)}
					<li>
						<button
							class="hover:text-amber max-w-[200px] truncate"
							type="button"
							onclick={() => {
								onSelectBook?.(book);
								resetChapter();

								selectedBook = book;
							}}
						>
							{book.title}
						</button>
					</li>
				{/each}
			</ol>
		{/if}
		{#if !authoredBook}
			<Input
				placeholder="Type a book title to search..."
				oninput={(e) =>
					e.target && pager?.deb((e.target as HTMLInputElement).value)}
			/>
			<PaginateUi
				useQuery={useGetBooks}
				{filter}
				paginate={{ start: 0, end: 10, size: 10 }}
				bind:this={pager}
			>
				{#snippet Render(data)}
					{#if typeof data !== 'object'}
						<span>No results found.</span>
					{/if}

					{#if data && typeof data === 'object' && 'message' in data === false}
						<ol
							class="max-w-full list-decimal list-inside truncate my-3px p-2 truncate"
						>
							{#each data as book (book.id)}
								<li>
									<button
										class="hover:text-amber max-w-[200px] truncate"
										type="button"
										onclick={() => {
											onSelectBook?.(book);
											resetChapter();

											selectedBook = book;
										}}
									>
										{book.title}
									</button>
								</li>
							{/each}
						</ol>
					{/if}
				{/snippet}
			</PaginateUi>
		{/if}
	</div>
{/if}
<h3>
	<span
		class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		Select Chapter({chapterFil.status ? chapterFil.status : 'Optional'}):
	</span>
	<b>
		<button
			class="hover:accent-amber"
			onclick={() => {
				selectedChapter = undefined;
			}}
		>
			{selectedChapter?.title}
		</button>
	</b>
</h3>
{#if selectedBook}
	<div class="max-w-[400px] rounded-lg border shadow-md">
		<Input
			type="number"
			placeholder="Search by chapter sequence"
			oninput={(e) =>
				e.target &&
				cpager?.deb((e.target as HTMLInputElement).value, 'filter.sequence')}
		/>
		<div class="p-3">
			<PaginateUi
				useQuery={useGetChaptersList}
				paginate={{ start: 0, end: 10, size: 10 }}
				filter={chapterFilter}
				bind:this={cpager}
			>
				{#snippet Render(data)}
					<span>
						{#if data && typeof data === 'object' && 'message' in data === false}
							<div class="flex flex-col gap-1">
								{#each data as chapter, index}
									<button
										class="max-w-[300px] truncate text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										onclick={() => {
											selectedChapter = chapter;
											onSelectChapter?.(chapter);
										}}
									>
										[{chapter.sequence.toFixed(2)}] {chapter.title}
										{chapter.status === 'draft' ? '[draft]' : ''}
									</button>
								{/each}
							</div>
						{/if}
					</span>
					<hr />
				{/snippet}
			</PaginateUi>
		</div>
	</div>
{/if}
