<script lang="ts">
	import Button from '$components/button.svelte';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import BookCard from '$components/bookCard.svelte';
	import Shelf from '$components/svg/shelf.svelte';
	import Text from '$components/text.svelte';
	import {
		useGetShelvedBooks,
		useGetShelvedBooksCount,
		useUpdateUserBookData
	} from '$lib/queries';
	import MoveFolder from './MoveFolder.svelte';
	import { useGetShelfFolders } from '$lib/queries/folders/folders';
	import { openAddBucketDialog } from './store.svelte';
	import { isDefaultFolder } from '$components/folders/folderUtils';
	import PaginateUi from '$components/PaginateUI.svelte';
	//import { differenceInCalendarYears } from 'date-fns';
	import { fade } from 'svelte/transition';
	import Dropdown from '$components/dropdown.svelte';
	import type { book, user_book_data } from '$lib/types';
	import { DEFAULT_FOLDER } from '$lib/data/constants';
	import type { profile } from '$lib/types';
	let { data }: { data: { profile: profile | null; publicProfile: profile } } =
		$props();

	const buckets = useGetShelfFolders();
	//const folders = $derived(buckets?.data?.folders.concat(['default']));
	const updateUserBookData = useUpdateUserBookData();
	const handleClickMove = () => {
		enableMove = !enableMove;
	};
	let enableMove = $state(false);
	let selectedMap = new Map();
	let idArray: number[] = $state([]);

	let shelvedUI = $state<PaginateUi<book, user_book_data, any, any> | null>(
		null
	);

	let currFolder = $derived(
		shelvedUI?.pageStore.join.filter.folder ?? DEFAULT_FOLDER
	);
	function handleFolderSelect(bucket: string = DEFAULT_FOLDER) {
		if (shelvedUI?.pageStore.join.filter.folder)
			shelvedUI.pageStore.join.filter.folder = bucket;
	}
</script>

<div class="glass my-1px md:my-2">
	<Text
		el="h1"
		class="text-3xl font-bold inline flex items-end text-amber-900 mt-2 border-green-500 border-groove "
	>
		<Shelf />Shelf
		<span class="text-[0.6em] text-amber-600 mx-2">
			#{shelvedUI?.totalQueryCountInt ?? 0}
		</span>
		<Button onclick={openAddBucketDialog} variant="link">
			+ Manage Folders
		</Button>
	</Text>
	<QueryLoaderRunes CreateQueryResult={buckets} isDataEmpty={() => false}>
		<div class="w-full inline-flex flex-wrap gap-2">
			{#if shelvedUI?.queryResult?.data?.length > 0}
				<Button
					variant="secondary"
					onclick={handleClickMove}
					disabled={shelvedUI?.totalQueryCountInt == 0}
				>
					<MoveFolder class="inline-block w-5 mr-2" /> Update Folder
				</Button>
			{/if}
			<button
				class="px-5 py-2.5 font-medium bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm capitalize {isDefaultFolder(
					currFolder
				)
					? ' from-magnum-100'
					: ''}"
				class:from-slate-400={isDefaultFolder(currFolder)}
				onclick={() => {
					handleFolderSelect();
				}}
			>
				default
			</button>

			{#each buckets.data?.folders ?? [] as item}
				<!-- content here -->
				<button
					class="px-5 py-2.5 font-medium {currFolder == item
						? 'bg-amber-50'
						: 'bg-blue-50'} hover:bg-blue-100 hover:text-blue-600 text-blue-400 rounded-lg text-sm"
					onclick={() => {
						handleFolderSelect(item);
					}}
				>
					{item}
				</button>
			{/each}
		</div>
	</QueryLoaderRunes>

	<div class="flex items-start gap-1 mt-1">
		<!-- Result {shelvedUI?.totalQueryCountInt} -->

		{#if idArray.length > 0}
			<Dropdown
				buttonString="Select A folder"
				items={{
					folder:
						buckets?.data?.folders.concat(['default'])?.map((v) => {
							return {
								str: v,
								onClick: () => {
									updateUserBookData.mutate(
										{ folder: v, book_ids: idArray },
										{
											onSuccess: () => {
												idArray = [];
												selectedMap.clear();
											}
										}
									);
								}
							};
						}) ?? []
				}}
			/>
		{/if}
	</div>
	<!-- shelved can contain is_visible=true -->
	<PaginateUi
		bind:this={shelvedUI}
		showCount={false}
		useCountQuery={useGetShelvedBooksCount}
		useQuery={useGetShelvedBooks}
		join={{
			withUserInfo: true,
			inner: true,
			filter: {
				is_shelved: true,
				user_id: data.publicProfile.id,
				folder: DEFAULT_FOLDER
			}
		}}
		paginate={{
			start: 0,
			size: 50,
			end: 50,
			orderWith: 'user_modified_at'
		}}
	>
		{#snippet Render(data)}
			<div
				class="w-full flex flex-wrap h-fit overflow-auto shadow-gentle justify-start pt-1"
				id="shelf"
			>
				{#each Array.isArray(data) ? data : [] as item (item.id)}
					{@const id = 'mover-' + item.id}
					<!-- content here -->
					<span transition:fade={{ delay: 250, duration: 300 }}>
						<BookCard book={item} type="simple2D" />
						{#if enableMove}
							<input
								type="checkbox"
								class="bg-green"
								{id}
								oninput={() => {
									let has = selectedMap.has(item.id);
									if (has) {
										selectedMap.delete(item.id);
									} else {
										idArray.push(item.id);
										selectedMap.set(item.id, idArray.length - 1);
									}
								}}
							/>
							<label for={id} class="text-sm">Move</label>
						{/if}
					</span>
				{/each}
				{#if data?.length == 0}
					<div>You have no book here...</div>
				{/if}
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
