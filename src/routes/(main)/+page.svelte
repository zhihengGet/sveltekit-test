<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import { default as Separator } from '$components/Separator.svelte';
	import BookCard from '$components/bookCard.svelte';
	import Collapse from '$components/collapse.svelte';
	import { TagsOptionGroup, bookFilter } from '$lib/data/filter';
	import { RangeToValue, ageRange } from '$lib/data/filter/age';
	import { useGetBooks, useGetFacetValue } from '$lib/queries/index.js';
	import {
		toggleCategory,
		trendingBooks,
		updateArrFilter,
		updateCategoryAndTags,
		updateSort
	} from '$lib/state';
	import {
		bookFilterStore as filterStore,
		updateFilter
	} from '$lib/state/filter.svelte.js';
	import { user } from '$lib/state/runes.svelte';
	import { keys } from '$lib/utils/getKeys';
	import { toastNotify } from '$lib/utils/toast';
	import { createPagination, melt } from '@melt-ui/svelte';
	import { usePortal } from '@melt-ui/svelte/internal/actions';
	import { differenceInYears } from 'date-fns';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Filter from 'lucide-svelte/icons/filter';
	import MoveUp from 'lucide-svelte/icons/move-up';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	/* 
	
		strategy:  make lead,status, language,category  mandatory fields 
		order by: like count and shelve count mandatory
	
	
	*/
	/* let { data } = $props();

	const books = $derived(data.books);
	const totalCount = $derived(data.count); */
	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages, range, page, totalPages },
		options: { count, perPage }
	} = createPagination({
		count: filterStore.paginate.size,
		perPage: filterStore.paginate.size,
		defaultPage: 1,
		siblingCount: 1
	});

	$effect(() => {
		// reset count
		if ({ ...filterStore.filter }) {
			$count = filterStore.paginate.size;
		}
	});

	$effect(() => {
		let lastPage = $totalPages === $page;
		//console.log('update page count', lastPage, book?.length, $count);
		if (lastPage && book?.length === $perPage) {
			count.update((v) => v + $perPage);
		}
		console.log('update pagination', book?.length, lastPage, $perPage);
	});

	$effect(() => {
		return range.subscribe((v) => {
			filterStore.paginate.start = v.start;
			filterStore.paginate.end = v.end;
		});
	});
	let counter = $derived({
		filter: filterStore.filter,
		options: {
			countOnly: true,
			countStrategy: 'estimated',
			shouldDebounce: true,
			debDelay: 600
		},
		paginate: { start: 0, end: 1, page: 1, size: 1 }
	} as const);
	const temp = useGetBooks(() => filterStore);
	//const temp = $derived(temp1.data.books);
	//do a separate query for count due to pagination, the count is same as all pages
	const totalCount = $derived({ data: temp.data?.matching }); //  useGetBooksCount(() => counter);
	const book = $derived(temp.data?.books);
	let categoryCount = $derived(
		temp.data?.facet.reduce((prev, curr) => {
			for (let category of curr.counts) prev[category.value] = category.count;
			return prev;
		}, {}) ?? {}
	);
	//$inspect(categoryCount, 'categoryCount');
	let openDrawer = $state(false);

	function portalToToolbar(node: HTMLElement) {
		const portal = usePortal(node);
		if (portal && portal.update) {
			portal?.update(document.body);
			onDestroy(() => {
				//clean up
				if (portal.destroy) portal.destroy();
			});
		}
	}
	$effect(() => {
		let age = differenceInYears(new Date(), user.birthday ?? new Date());
		if (!user.birthday) {
			return;
		}
		let prev = ageRange[0];
		for (let x of ageRange) {
			if (age < x[0]) {
				break;
			}
			prev = x;
		}

		filterStore.filter.audience = RangeToValue(prev[0], prev[1]);
	});
	const facets = useGetFacetValue();
	let genreCounts = $derived(
		facets.data?.facet_counts?.reduce((prev, curr) => {
			for (let x of curr.counts) {
				prev[x.value] = x.count;
			}
			return prev;
		}, {}) ?? {}
	);
	//export { FilterUI };
</script>

<!-- <div
	class="grad2 bottom-0 left-0 h-screen w-screen from-[#b7e2d2] to-[#f4f9f4] fixed"
/>
 -->

{#snippet FilterUI()}
	<h1 class="font-bold text-xl cursor-pointer">
		Explore
		<!-- <Button
			onclick={clearFilter}
			variant="ghost"
			class="text-sm float-right capitalize"
		>
			Reset
		</Button> -->
	</h1>
	<Separator />
	<!-- Time -->
	<Collapse>
		{#snippet title()}
			<h4 class="font-bold text-sm">Release Time</h4>
		{/snippet}
		<div class="grid grid-cols-2">
			{#each bookFilter['created_at'] as subitem}
				{@const has = filterStore.filter['created_at'] == subitem}
				<button
					class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize"
					onclick={() =>
						updateFilter({
							key: 'created_at',
							value: subitem
						})}
					class:selected={has}
				>
					{subitem}
				</button>
			{/each}
		</div>
	</Collapse>
	<!-- Time -->
	<Collapse>
		{#snippet title()}
			<h4 class="font-bold text-sm">Update Time</h4>
		{/snippet}
		<div class="grid grid-cols-2 gap-1">
			{#each bookFilter['updated_at'] as subitem (subitem)}
				{@const has = filterStore.filter['user_modified_at'] == subitem}
				<button
					class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize"
					onclick={() =>
						updateFilter({
							key: 'user_modified_at',
							value: subitem
						})}
					class:selected={has}
				>
					{subitem}
				</button>
			{/each}
		</div>
	</Collapse>
	<!--status, lead -->
	{#each keys(bookFilter.string) as item (item)}
		{@const key = item}
		{@const subLabel = bookFilter.string[item]}
		<Collapse>
			{#snippet title()}
				<h4 class="font-bold text-sm">
					{item}
				</h4>
			{/snippet}
			<!-- <h4 class="font-bold text-sm">
				{item}
			</h4> -->
			<div class="grid grid-cols-2 gap-1">
				{#each subLabel as subitem (subitem)}
					{@const value = subitem}
					{@const has = filterStore.filter[key] == value}
					<button
						class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize border-amber"
						class:selected={has}
						onclick={() => updateFilter({ key: key, value: value })}
					>
						{subitem}
					</button>
				{/each}
			</div>
		</Collapse>
	{/each}
	{#each keys(bookFilter.multi) as item (item)}
		{@const key = bookFilter.multi[item].db_key}
		{@const value = bookFilter.multi[item].value}
		<Collapse>
			{#snippet title()}
				<h4 class="font-bold text-sm">
					{item}
				</h4>
			{/snippet}
			<div class="grid grid-cols-2 gap-1">
				{#each value as subitem (subitem)}
					{@const value = subitem}
					{@const label = bookFilter.multi[item].label[value] || value}
					{@const has = filterStore.filter[key]?.includes(value)}
					<button
						class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize border-amber"
						class:selected={has}
						onclick={() => updateArrFilter({ key: key, value: value })}
					>
						{label}
					</button>
				{/each}
			</div>
		</Collapse>
	{/each}
	<!-- language, average rating, character count-->
	{#each keys(bookFilter.objectLabel).filter((v) => v != 'language') as item (item)}
		{@const key = bookFilter.objectLabel[item].value}
		{@const subLabel = bookFilter.objectLabel[item].subLabel}

		<Collapse isOpen={true}>
			{#snippet title()}
				<h4 class="font-bold block text-sm">
					{item}
					<!-- 	{key === 'language' ? filterStore.filter['language'] : ''} -->
				</h4>
			{/snippet}
			<div class="grid grid-cols-2 gap-1">
				{#each subLabel as subitem (subitem)}
					<!-- 	{@const t = bookFilter.string['character count']} -->
					{@const t = bookFilter.objectLabel[item]['subLabelValues']}
					{@const value = subitem as unknown as keyof typeof t}
					{@const has =
						filterStore.filter[key] ==
						bookFilter.objectLabel[item]['subLabelValues'][value]}
					<button
						class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize border-amber"
						class:selected={has}
						onclick={() =>
							updateFilter({
								key: key,
								value: bookFilter.objectLabel[item]['subLabelValues'][value]
							})}
					>
						{subitem}
					</button>
				{/each}
			</div>
		</Collapse>
	{/each}
	<!-- categories -->
	<div>
		{#each keys(TagsOptionGroup) as item (item)}
			{@const has = filterStore.filter.category == item}
			<div>
				<Collapse>
					{#snippet title()}
						<h1 class:selected_category={has}>
							<button
								onclick={() => toggleCategory(item, filterStore)}
								class="capitalize"
							>
								{item}
								<span class="text-sm text-amber-600">{genreCounts[item]}</span>
								{filterStore.filter.category == item ? '⛳' : ''}
							</button>
						</h1>
					{/snippet}

					<div class="list-disc capitalize grid grid-cols-2 gap-1">
						<!-- sub category -->
						{#each TagsOptionGroup[item] as subitem (subitem)}
							{@const has =
								!!filterStore.filter.tags?.includes(subitem.value) &&
								filterStore.filter.category === item}
							<button
								class="w-full inline-block md:hover:bg-amber text-center text-sm truncate capitalize"
								class:selected={has}
								onclick={() => updateCategoryAndTags(item, subitem.value)}
							>
								{subitem.label}
							</button>
						{/each}
					</div>
				</Collapse>
			</div>
		{/each}
	</div>
{/snippet}

<div
	class="mx-auto w-full md:w-[80%] flex gap-7 relative min-h-screen green_background"
>
	<!-- filters -->
	<div
		class="sticky top-0 align-top hidden md:flex flex-col md:w-1/3 max-h-[89vh] overflow-auto glass p-2"
	>
		{@render FilterUI()}
	</div>

	<!-- center top toolbar -->
	<div class="w-full overflow-auto">
		<div class="mb-1 px-5 w-full h-10 flex items-center gap-2 glass">
			<Drawer title="" description="" bind:open={openDrawer} class="max-h-9/10">
				{#snippet trigger({ props })}
					<button {...props} class=" md:hidden">
						<Filter />
					</button>
				{/snippet}

				<div class="overflow-y-auto max-h-8/10 px-2">
					{@render FilterUI()}
				</div>
			</Drawer>
			<button
				class="h-10 min-w-12 rounded px-1 text-sm"
				onclick={() => {
					$page = 1;
					trendingBooks();
					toastNotify.success('updated');
				}}
			>
				Trending
			</button>
			<button
				onclick={() => {
					$page = 1;
					updateSort({ value: 'like_count' });
				}}
				class="h-10 min-w-10 rounded px-1 text-sm md:text-nowrap font-mono"
				class:selected={filterStore.paginate.orderWith == 'like_count'}
			>
				<div class="inline-block w-fit text-center">Like</div>
				<MoveUp
					class="inline p-0 w-4 h-4 md:(w-[20px] h-[20px]) {filterStore.paginate
						.orderWith == 'like_count' && filterStore.paginate.asc
						? 'rotate-180'
						: ''}"
				/>
			</button>
			<button
				class=" h-10 min-w-10 rounded px-1 text-sm text-nowrap"
				class:selected={filterStore.paginate.orderWith == 'shelved_count'}
				onclick={() => {
					$page = 1;
					updateSort({ value: 'shelved_count' });
				}}
			>
				Shelved<MoveUp
					class="inline w-4 h-4 md:(w-[20px] h-[20px]) {filterStore.paginate
						.orderWith == 'shelved_count' && filterStore.paginate.asc
						? 'rotate-180'
						: ''}"
				/>
			</button>
			<span
				class="block text-right grow-1 mr-5 text-sm text-nowrap"
				transition:fade={{ delay: 250, duration: 300 }}
			>
				{totalCount.data} Results
			</span>
		</div>
		<!-- middle column -->
		<div
			class="inline-flex align-top border-t-indigo-400 flex-auto border-t-2 p-4 flex-wrap flex-row justify-around gap-3"
		>
			<QueryLoaderRunes CreateQueryResult={temp}>
				{#each book ?? [] as item, index}
					<span out:fade={{ delay: 250, duration: 50 }}>
						<BookCard type="qidian" book={item} {index} />
					</span>
				{/each}
			</QueryLoaderRunes>
		</div>
		<!-- prev/next page buttons  -->
		<div
			class="fixed absolute bottom-10 w-screen flex items-center justify-center md:bottom-0"
			class:hidden={totalCount.data == 0}
			use:portalToToolbar
		>
			<nav
				class="flex flex-col items-center gap-2 glass font-mono w-160px"
				aria-label="pagination"
				use:melt={$root}
			>
				<p class="text-center text-magnum-900 text-sm">
					Showing {$range.start} - {$range.end}
				</p>
				<div class="flex items-center gap-1">
					<button
						class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
				hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
				data-[selected]:text-white"
						use:melt={$prevButton}
					>
						<ChevronLeft class="square-4" />
					</button>

					<button
						class="grid h-8 items-center rounded-md bg-white px-3 text-sm text-magnum-900 shadow-sm
				hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-magnum-900
			  data-[selected]:text-white"
						{...$nextButton}
						use:nextButton
					>
						<ChevronRight />
					</button>
				</div>
			</nav>
		</div>
	</div>
	<!-- third columns -->
	<div
		class="hidden md:inline-block sticky top-0 overflow-auto align-top max-h-screen md:visible md:w-1/3"
	>
		<h1 class="prose lg:prose-xl capitalize font-bold underline">List</h1>
		<ol class="list-decimal list-inside">
			{#each book ?? [] as item (item.id)}
				<!-- content here -->
				<li class="text-nowrap truncate mix-blend-difference max-w-full">
					<a
						href="/book/{item.id}"
						class="text-sm truncate h-6 hover:underline cursor-pointer"
					>
						{item.title}
					</a>
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	:global(body:has(.green_background)) {
		background: linear-gradient(135deg, rgb(225, 253, 243) 0%, #fefffe 100%);
		background-repeat: no-repeat;
		background-attachment: fixed;
		background-size: cover;
	}
	.glass_blur {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(14.1px);
		-webkit-backdrop-filter: blur(14.1px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	.selected {
		background-color: #b7e2d2;
		border-radius: 3%;
		font-size: smaller;
		padding: 2px;
		@apply shadow font-medium shadow-slate-200;
	}
	.selected_category {
		background-color: #18724c;
		color: blanchedalmond;
		border-radius: 10px;
		padding: 2px;
		text-transform: capitalize;
	}
</style>
