<script lang="ts" generics="TData">
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { MediaQuery } from 'runed';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import type { paginateQuery, user_chatroom_data } from '$lib/types';
	import type { CreateQueryResult } from '@tanstack/svelte-query';
	import { untrack, type Snippet } from 'svelte';
	import QueryLoaderRunes from './QueryLoaderRunes.svelte';
	import Input from './ui/input/input.svelte';
	import Label from './ui/label/label.svelte';
	import { debounce } from 'lodash-es';

	let {
		count = 0 /* total count */,
		useQuery,
		filter,
		size /* item per page */,
		hasSize /* show page number of just next/prev page */,
		child,
		enableSearch = false,
		getLastCursor,
		cursorPagination = false /* offset liit based vs cursor based */
	}: {
		count?: number;
		enableSearch: boolean;
		hasSize: boolean;
		cursorPagination: boolean;
		child: Snippet<[{ data: TData | undefined }]>;
		size: number;
		useQuery: (args: () => paginateQuery<any>) => CreateQueryResult<TData>;
		filter?: paginateQuery<any>['filter'];
		getLastCursor?: (data: TData) => number | string;
	} = $props();
	const isDesktop = new MediaQuery('(min-width: 768px)');
	const perPage = $derived(isDesktop.matches ? 20 : size);
	let items_count = $state(hasSize || !count ? perPage : count);
	let currPage = $state(1);
	let last_cursor = $state();
	let update_cursor = $state([undefined]);
	let search = $state();
	let params = $derived({
		filter: filter ?? {},
		search: { regex: search },
		paginate: {
			start: currPage * perPage - perPage,
			end: currPage * perPage + perPage - perPage,
			size: perPage,
			last_cursor: last_cursor
		} as paginateQuery<any>['paginate']
	} as paginateQuery);
	const query = useQuery(() => {
		return params;
	});
	//mode 1: show total count
	// mode 2: show next only
	// update count
	$effect(() => {
		if (hasSize == false && query.data?.length) {
			untrack(() => {
				console.log('ab', items_count, query.data?.length);
				if (query.data?.length == perPage) {
					items_count += perPage;
				}
			});
		}
	});
	let max = 0;
	$effect(() => {
		// 1 2 3
		// null 1 2

		console.log('d');
		if (query.data?.length === perPage) {
			untrack(() => {
				let n = getLastCursor?.(query.data);
				if (currPage > max) update_cursor.push(n);
				max = Math.max(max, currPage);
			});
		}
	});
	$effect(() => {
		if (currPage > 0) {
			console.log('c');
			last_cursor = untrack(() => update_cursor[currPage - 1]);
		}
	});
	const siblingCount = $derived(isDesktop.matches ? 1 : 0);
	const deb = debounce((v) => {
		search = v;
	});
</script>

<!-- {items_count} -->
<!-- {JSON.stringify(update_cursor)} -->

<div class="m-2" class:hidden={!enableSearch}>
	<Label>Search Group Name</Label>
	<Input placeholder="Search room name" oninput={(e) => deb(e.target.value)} />
</div>
<Pagination.Root
	count={items_count}
	{perPage}
	{siblingCount}
	bind:page={currPage}
>
	{#snippet children({ pages, currentPage })}
		<QueryLoaderRunes CreateQueryResult={query}></QueryLoaderRunes>
		{@render child?.({ data: query.data })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton
					onclick={() => {
						console.log('prev');
					}}
				>
					<ChevronLeft class="size-4" />
					<span class="hidden sm:block">Previous</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#if hasSize}
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
			{/if}
			<Pagination.Item>
				<Pagination.NextButton>
					<span class="hidden sm:block">Next</span>
					<ChevronRight class="size-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
