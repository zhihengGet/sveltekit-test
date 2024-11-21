<script lang="ts" generics="Entity,U={},TData={},TE={}">
	import { useInfiniteScroll } from '$lib/utils/useInfiniteScroll.svelte';

	import Input from './ui/input/input.svelte';

	import { debounce, merge, orderBy, set, unset } from 'lodash-es';

	import type { paginateQuery } from '$lib/types';
	import { createPagination, melt } from '@melt-ui/svelte';
	import { hashKey, type CreateQueryResult } from '@tanstack/svelte-query';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import QueryLoaderRunes from './QueryLoaderRunes.svelte';
	import { onDestroy, onMount, untrack, type Snippet } from 'svelte';
	import ChevronRightIcon from '$lib/icons/arrow/ChevronRightIcon.svelte';
	import { twMerge } from 'tailwind-merge';
	import Dropdown from './dropdown.svelte';
	import EmptyChatIcon from '$lib/icons/chat/EmptyChatIcon.svelte';
	import Oval from '$lib/icons/loader/oval.svelte';
	import { OvalSpinner } from '$lib/icons';
	type host = paginateQuery<Entity, U>;
	type p = {
		totalCount?: number;
		data?: TData;
		showCount?: boolean;
		showButton?: boolean;
		keepCount?: boolean;
		showOrderBy?: boolean;
		showFilterBy?: boolean;
		RegexSearch?: boolean;
		orderByOptions?: host['paginate']['orderWithMultiple'];
		filterByOptions?: host['filter'];
		buttons?: Snippet<
			[{ next: () => {}; prev: () => {}; hasNext: boolean; hasPrev: boolean }]
		>;
		//paginateQuery: host;
		useCountQuery?: (arg: () => host) => CreateQueryResult<number | null, TE>;
		useQuery?:
			| ((arg: () => host) => CreateQueryResult<TData, TE>)
			| (() => CreateQueryResult<TData, TE>);
		children?: Snippet<[TData]>;
		Render?: Snippet<[TData]>;
		paginate?: paginateQuery<Entity>['paginate'];
		/* should not be reactive */
		filter?: { [s in keyof Entity]: Entity[s][] };
		join?: paginateQuery<Entity>['join'];
		useDerived?: boolean;
		scroll?: boolean;
		scroller?: Snippet<[{ ref: (node: Element) => any; data: TData[] }]>;
		class?: string;
	} & host;
	let {
		useQuery,
		showOrderBy = false,
		showFilterBy = false,
		buttons,
		data,
		filter,
		paginate = { start: 0, end: 10, size: 10, orderWith: 'user_modified_at' },
		showCount = false,
		search = { regex: '' },
		useCountQuery,
		showButton = true,
		restFilter,
		keepCount = false,
		children,
		Render,
		useDerived = false,
		scroll = false,
		scroller: Scroller,
		filterByOptions,
		...params
	}: p = $props();
	export const deb = debounce(
		(s: string, field = 'search.regex') => set(pageStore, field, s),
		500
	);
	const countCacheMap = new Map();
	const prevResults = {}; // sometime u want to keep track of previous result , i.e count when changing props

	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages, range, page, totalPages },
		options: { count }
	} = createPagination({
		count: paginate.size || 10,
		perPage: paginate.size || 10,
		defaultPage: 1,
		siblingCount: 1
	});
	//@ts-ignore
	let pageStore: host = $state({
		...params,
		filter: filter,
		paginate: {
			//@ts-ignore
			start: 0, //@ts-ignore
			end: 10, //@ts-ignore
			size: 10,
			...paginate
		},
		search: { regex: search.regex },
		restFilter: restFilter,

		options: {}
	});
	function nextPage() {
		if ($page < $totalPages) page.update((v) => v + 1);
	}
	function prevPage() {
		if ($page > 1) page.update((v) => v + 1);
	}
	//@ts-ignore
	let pageStoreDerived: host = $derived({
		...params,
		filter: filter,
		paginate: {
			//@ts-ignore
			start: 0, //@ts-ignore
			end: 10, //@ts-ignore
			size: 10,
			...paginate
		},
		search: { regex: search.regex },
		restFilter: restFilter,
		options: {}
	});
	const store = $derived(useDerived ? pageStoreDerived : pageStore);
	// sync derived and $state

	// we should only allow either derivedPageStore to be updated or pageStore to be updated
	$effect(() => {
		// update pageStore on pageStoreDerived change
		if (pageStoreDerived.filter) {
			pageStore = Object.assign(pageStore, $state.snapshot(pageStoreDerived));
		}
	});
	// update start,end
	onMount(() => {
		return range.subscribe((v) => {
			if (pageStore!.paginate!.start != v.start)
				Object.assign(pageStore.paginate, v);
		});
	});
	/* $effect(() => {
		//when query filter change
		if ({ ...pageStore.filter, ...pageStore?.join?.joinFilter }) {
			//reset count
			$count = pageStore.paginate!.size;
		}
	}); */
	// update props
	/* $effect(() => {
		if (filter)
			untrack(() => {
				if (filter) Object.assign(pageStore.filter, filter);
			});
	}); */
	$effect(() => {
		untrack(() => {
			merge(pageStore.paginate, paginate);
		});
	});
	$effect(() => {
		untrack(() => {
			// extra stuff
			merge(pageStore.extra, params.extra);
		});
	});
	$effect(() => {
		if (search?.regex) pageStore.search!.regex = search?.regex;
	});
	const countOptions = $derived({
		...pageStore,
		options: { countStrategy: 'estimated' as const },
		paginate: { start: 0, end: 0, orderWith: 'updated_at' } // for count we don't care about paginate
	});
	export function getCountCache(key: typeof countOptions) {
		return countCacheMap.get(hashKey([countOptions]));
	}
	export const updatePageStore = (s: string, field = 'search.regex') =>
		set(pageStore, field, s);

	onDestroy(() => {
		countCacheMap.clear();
	});
	const totalQueryCount = showCount
		? useCountQuery?.(() => countOptions)
		: { data: null };
	const totalQueryCountInt = $derived(totalQueryCount?.data);
	const queryResult = useQuery?.(() => pageStore);
	/* $effect(() => {
		console.log('query ', queryResult);
	}); */
	$effect(() => {
		if (keepCount)
			countCacheMap.set(hashKey([countOptions]), totalQueryCountInt);
	});
	const shouldHideCount = $derived(
		pageStore.paginate.start === 0 &&
			Array.isArray(queryResult?.data) &&
			(queryResult?.data?.length ?? 0) < pageStore.paginate.size
	);

	// update count
	$effect(() => {
		if (showCount == false && queryResult?.data) {
			console.log('show count');
			untrack(() => {
				//we don't want to show how many item are there
				if (
					Array.isArray(queryResult.data) &&
					queryResult.data.length >= pageStore.paginate?.size
				) {
					//pageStore.paginate!.totalSize += pageStore.paginate.size;
					count.update((v) => v + pageStore.paginate.size);
				}
			});
		}
	});
	$effect(() => {
		if (showCount && totalQueryCount?.data) {
			console.log('show total count', totalQueryCount);
			count.set(totalQueryCount?.data);
		}
	});
	//let RSearch = $derived(RegexSearch);
	export {
		pageStore,
		queryResult,
		PageNumber,
		LeftButton,
		RightButton,
		RegexSearch,
		totalQueryCountInt,
		pageStoreDerived
	};
	const data_stack: TData[] = $state([]);
	const prev_page = { start: 0 };
	$effect(() => {
		if (
			scroll &&
			store.paginate.start !== prev_page.start &&
			queryResult?.isSuccess
		) {
			prev_page.start = store.paginate.start;
			data_stack.push(queryResult?.data);
		}
	});
	const scrollerRef = $derived({
		hasNextPage: () => true,
		loading: () => queryResult?.isFetching ?? false,
		onLoadMore: () => {
			if (
				!(
					queryResult &&
					Array.isArray(queryResult.data) &&
					queryResult.data.length >= pageStore.paginate?.size
				)
			) {
				return;
			}
			const s = store.paginate.end - store.paginate.start;
			store.paginate.start += s;
			store.paginate.end += s;
			//store.paginate.page += 1;
		},
		delayInMs: 200,
		disabled: () => queryResult?.isFetching ?? false,
		rootMargin: 20
	});
	const orderOptions =
		params.orderByOptions ||
		($state.snapshot(pageStore.paginate.orderWithMultiple) as any);
	const ref = scroll ? useInfiniteScroll(scrollerRef) : () => {};
</script>

{#if orderOptions && showOrderBy}
	<div>
		<Dropdown
			buttonString="Sort"
			items={{
				'sort by': Object.keys(orderOptions ?? {}).map((v) => {
					return {
						str: v,
						onClick: () => {
							//@ts-ignore
							pageStore.paginate.orderWithMultiple = {
								[v]: { asc: false }
							};
							if (pageStore.paginate.orderWithMultiple) {
								orderOptions[v].asc = !orderOptions![v].asc;
								//@ts-expect-error
								pageStore.paginate.orderWithMultiple[v].asc =
									orderOptions[v].asc;
							}
						}
					};
				})
			}}
		/>
	</div>
{/if}
{#if filterByOptions && showFilterBy}
	<div>
		<Dropdown
			buttonString="Sort"
			items={{
				'sort by': Object.keys(filterByOptions ?? {}).map((v) => {
					return {
						str: v,
						onClick: () => {
							//@ts-ignore
							pageStore.paginate.orderWithMultiple = {
								[v]: { asc: false }
							};
							if (pageStore.paginate.orderWithMultiple) {
								orderOptions[v].asc = !orderOptions![v].asc;
								//@ts-expect-error
								pageStore.paginate.orderWithMultiple[v].asc =
									orderOptions[v].asc;
							}
						}
					};
				})
			}}
		/>
	</div>
{/if}
<!-- {#if pageStore.paginate.orderWith && showOrderBy && !orderOptions}
	<div>
		<Dropdown
			buttonString="Sort"
			items={{
				'sort by': [
					{
						str: pageStore.paginate.orderWith,
						onClick: () => {
							pageStore.paginate.asc = !pageStore.paginate.asc;
						}
					}
				]
			}}
		/>
	</div>
{/if} -->
{#if scroll}
	<div class={twMerge('max-h-80% overflow-auto', params.class)}>
		{@render Scroller?.({ data: data_stack, ref })}
		{data_stack.length}
		<div class="h-200px"></div>
		{#if queryResult?.isLoading}
			<OvalSpinner />
		{/if}
		<div use:ref class="w-1em h-1em">⚔ {data?.length}</div>
	</div>
{/if}
{#if !scroll}
	<QueryLoaderRunes CreateQueryResult={queryResult}>
		{#if queryResult?.data}
			{@render children?.(queryResult?.data)}
			{@render Render?.(queryResult.data)}
		{/if}
	</QueryLoaderRunes>
{/if}

{#snippet PageNumber()}
	{#if showCount}
		{#each $pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<span>...</span>
			{:else}
				<button
					class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
data-[selected]:text-white"
					{...$pageTrigger(page)}
					use:pageTrigger
				>
					{page.value}
				</button>
			{/if}
		{/each}
	{/if}
{/snippet}
{#snippet LeftButton()}
	<button
		class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
data-[selected]:text-white"
		{...$prevButton}
		use:prevButton
	>
		<ChevronLeft />
	</button>
{/snippet}
{#snippet RightButton()}
	<button
		class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
data-[selected]:text-white"
		{...$nextButton}
		use:nextButton
	>
		<ChevronRightIcon />
	</button>
{/snippet}
{#snippet RegexSearch()}
	<Input onchange={(e) => deb(e.target.value ?? '')} />
{/snippet}

<nav
	class={twMerge(
		'flex flex-col items-center gap-4',
		shouldHideCount ? 'hidden' : ''
	)}
	aria-label="pagination"
	{...$root}
	use:root
>
	{#if buttons}
		{@render buttons({})}
	{/if}
	<p class="text-center text-magnum-900" class:hidden={showCount == false}>
		Showing items {$range.start} - {$range.end}
	</p>

	<div class="flex items-center gap-2">
		<button
			class:hidden={!showButton}
			class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
		hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
		data-[selected]:text-white"
			{...$prevButton}
			use:prevButton
		>
			<ChevronLeft />
		</button>
		{#if showCount}
			{#each $pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<span>...</span>
				{:else}
					<button
						class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
		hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
	  data-[selected]:text-white"
						{...$pageTrigger(page)}
						use:pageTrigger
					>
						{page.value}
					</button>
				{/if}
			{/each}
		{/if}
		<button
			class:hidden={!showButton}
			class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
		hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
	  data-[selected]:text-white"
			{...$nextButton}
			use:nextButton
		>
			<ChevronRightIcon />
		</button>
	</div>
</nav>
