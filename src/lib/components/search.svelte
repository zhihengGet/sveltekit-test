<script lang="ts">
	import { useSearchBooks } from '$lib/queries/book/getBooks';
	import { createCombobox, melt } from '@melt-ui/svelte';
	import SearchIcon from 'lucide-svelte/icons/search';
	import { onDestroy, untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import Drawer from './Drawer.svelte';
	import Input from './ui/input/input.svelte';
	import { useMediaQuery } from '$lib/utils/mediaQuery.svelte';
	import Image from './Image.svelte';

	let {
		class: classes,
		...props
	}: {
		class?: string;
		style?: string;
	} = $props();

	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput },
		helpers: { isSelected }
	} = createCombobox({
		forceVisible: true
	});
	let text = $state({ searchText: '' });
	$effect(() => {
		return inputValue.subscribe((v) => {
			untrack(() => {
				text.searchText = v;
			});
		});
	});
	let search = useSearchBooks(() => text);
	let openDrawer = $state(false);
	const isMobile = useMediaQuery('(max-width: 700px)');
</script>

<div class="inline-flex flex-col gap-1 {classes}">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label use:melt={$label} class="hidden">Search</label>

	<div class="relative">
		<input
			use:melt={$input}
			class="h-10 rounded-sm w-full px-3 text-black"
			{...props}
			placeholder={!isMobile.match ? 'Search...' : ''}
		/>
		<button
			class="absolute right-1 top-1/2 z-10 -translate-y-1/2 text-magnum-900 hover:text-magnum-500"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				openDrawer = true;
			}}
		>
			<SearchIcon class="square-4" />
		</button>
	</div>
</div>
<!-- render drawer on click on search icon instead of combobox -->
<Drawer
	title="Search"
	description="Please type the title of book"
	bind:open={openDrawer}
>
	<div class="max-w-90vw md:max-w-400px max-h-50vh overflow-y-auto p-2">
		<Input
			class="h-10 rounded-lg px-3 max-w-8/10 text-black mb-2 mx-auto"
			placeholder="Enter a book title"
			name="title"
			type="text"
			bind:value={text.searchText}
		/>

		<ol class="w-full max-w-full">
			{@render SearchResult()}
		</ol>

		<span
			class:hidden={search.data?.length == 0 || search.isLoading === true}
			class="font-300 text-coolgray"
		>
			END
		</span>
	</div>
</Drawer>
{#snippet SearchResult()}
	{#each search.data ?? [] as book, index (index)}
		<li class="mb-2 w-full h-fit">
			<a class="flex w-full" href="/book/{book.id}">
				<Image class="book w-12 inline-block mr-2" src={book.cover_url} />
				<div class="flex w-8/10 flex-col items-start justify-around">
					<div class="font-medium max-w-9/10 truncate break-all">
						{book.title}
					</div>
					<div class="text-sm font-350 truncate break-all">
						{book.author_name}
					</div>
				</div>
			</a>
		</li>
	{:else}
		<li
			class="relative cursor-pointer rounded-md py-1 pl-8 pr-4
  data-[highlighted]:bg-magnum-100 data-[highlighted]:text-magnum-700"
		>
			No results found
		</li>
	{/each}
{/snippet}
<!-- render dropdown on input -->
{#if $open}
	<ul
		class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-lg"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<div
			class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black"
		>
			<ol class="text-nowrap">
				{@render SearchResult()}
			</ol>
		</div>
	</ul>
{/if}

<style lang="postcss">
	.check {
		@apply absolute left-2 top-1/2 text-magnum-500;
		translate: 0 calc(-50% + 1px);
	}
</style>
