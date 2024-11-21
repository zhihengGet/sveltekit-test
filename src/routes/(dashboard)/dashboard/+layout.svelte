<script lang="ts">
	import { Button } from '$components';
	import { isDefaultFolder } from '$components/folders/folderUtils';
	import { X } from '$lib/icons';
	import { log_out, useGetAllAuthoredBooks } from '$lib/queries';
	import { useGetAuthorFolders } from '$lib/queries/folders/authorFolder';
	import { groupBy } from 'lodash-es';
	import { dashboardBookStore } from './BookStore.svelte';
	import NewBook from './NewBook.svelte';
	import Table from './table.svelte';
	import ChartIcon from '$lib/icons/chartIcon.svelte';
	import Income from '$lib/icons/income.svelte';
	import { user } from '$lib/state/runes.svelte';
	import FolderManager from '$components/shared/FolderManager.svelte';
	import { DEFAULT_FOLDER } from '$lib/data/constants';
	import PreviewGenerator from '$lib/composite/PreviewGenerator.svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
	import HeaderBuilt from '$lib/composite/HeaderBuilt.svelte';
	import MessageMailer from './MessageMailer.svelte';
	let { children } = $props();
	const books = useGetAllAuthoredBooks();
	const author_buck = useGetAuthorFolders();

	const groupBookByFolder = $derived(
		groupBy(books.data, (v) =>
			isDefaultFolder(
				v?.user_book_data?.[0]?.author_folder,
				author_buck.data?.folders ?? []
			)
				? DEFAULT_FOLDER
				: v.user_book_data?.[0]?.author_folder
		)
	);

	let all_buckets = $derived(author_buck.data?.folders || []);
	let leftBar: HTMLElement | undefined = $state();
	let currFolder = $state(DEFAULT_FOLDER);
	let openPreview = $state(false);
	let openMailer = $state(false);
</script>

{#if dashboardBookStore.openCreateBook}
	<NewBook bind:open={dashboardBookStore.openCreateBook} />
{/if}

<FolderManager
	type="author"
	bind:bindOpen={dashboardBookStore.openAddFolderDialog}
/>
<PreviewGenerator bind:open={openPreview} />
<MessageMailer bind:isOpen={openMailer} title="Message Your Followers" />
<div
	class="relative inline-flex w-screen max-w-screen gap-0 lg:gap-10 bg-white whitespace-nowrap overflow-y-hidden overflow-x-auto"
>
	<!-- left side bar -->
	<div
		class="sticky top-0 left-0 inline-flex h-screen w-16 md:w-80 flex-col border-1 transition-transform"
		bind:this={leftBar}
	>
		<!-- desktop -->
		<div class="h-[15%]">
			<button class="flex w-full justify-end"><X class="mr-5 mt-5" /></button>
			<div class="flex flex-col items-center justify-center">
				<h1 class="text-2xl block">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 2048 2048"
						class="inline"
					>
						<path
							fill="currentColor"
							d="M1747 290q14 8 23 23t9 32q0 8-2 15t-5 14l-707 1415q-9 19-28 28l-173 87q-32 16-69 16h-9q-4 0-10-1l-47 94q-8 16-23 25t-34 10q-26 0-45-19t-19-45q0-12 7-30t16-37t20-37t15-28q-26-40-26-87v-165q0-16 7-29l576-1152l-65-32l-237 474q-8 16-23 25t-34 10q-26 0-45-19t-19-45q0-13 7-29l239-478q16-32 43-50t63-19q35 0 66 17t62 32l71-142q8-17 23-26t34-9q13 0 22 4q12-24 23-47t26-43t36-30t53-12q32 0 61 15l94 47q32 16 50 42t19 64q0 34-15 63t-30 59zm-202-101l87 43l29-58l-87-43l-29 58zm84 185l-192-96l-669 1337v150q0 11 8 19t19 8q4 0 16-5t29-13t35-17t36-19t30-16t19-10l669-1338zm163 394q53 0 99 20t82 55t55 81t20 100q0 53-20 99t-55 82t-81 55t-100 20h-288l64-128h224q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10q-26 0-45-19t-19-45q0-26 19-45t45-19zM128 1600q0 66 25 124t68 102t102 69t125 25h44q-5 15-8 31t-4 33q0 17 3 33t9 31h-44q-93 0-174-35t-142-96t-96-142t-36-175q0-93 35-174t96-142t142-96t175-36h224l-64 128H448q-66 0-124 25t-102 69t-69 102t-25 124z"
						/>
					</svg>
					<a href="/dashboard" class="hidden md:block">Welcome</a>
				</h1>
			</div>
		</div>
		<!-- dashboard button -->
		<div
			class="grow-1 flex flex-col items-center justify-center md:justify-start"
		>
			<Button
				href="/dashboard/statistics#top"
				variant="ghost"
				class="flex justify-between "
			>
				<ChartIcon class="w-[20px] shrink-0" />
				<span class="hidden md:block">Statistics</span>
			</Button>
			<!-- 	<Button variant="ghost" class="flex justify-between" disabled={true}>
				<span class="w-[20px] shrink-0">⏰</span>
				<Text class="hidden md:inline">Promote</Text>
			</Button>-->
			<Button variant="ghost" class="flex justify-between" disabled>
				<Income class="w-[20px] shrink-0" />
				<span class="hidden md:inline">&nbsp;Income</span>
			</Button>
		</div>
		<div
			class="shrink-1 h-50 md:h-50 hidden md:flex items-center md:justify-start flex-col"
		>
			<Button
				onclick={async () => {
					await log_out();
					window.location.reload();
				}}
				variant="ghost"
				class="w-90% inline-block  truncate"
			>
				Log Out {user?.username}
			</Button>
			<a class="text-sm hover:text-amber" href="/">Back to home</a>
		</div>
		<!-- 	<div class="h-40 flex items-center justify-center flex-col">
			<button
				onclick={() => {
					leftBar?.classList.toggle('w-16');
					leftBar?.classList.toggle('w-80');
				}}
				class="flex items-center justify-center"
			>
				<LogOut class="my-auto block md:hidden" />
			</button>
			<a
				class="text-sm hover:text-amber md:hidden flex justify-center mt-5 hover:text-amber"
				href="/"
			>
				Home
			</a>
		</div> -->
	</div>
	<!-- right panel -->
	<div class="grow-1 max-w-full max-h-screen overflow-auto">
		<div
			class="border-1 w-50 max-h-1/10 mt-5 inline-flex items-center justify-center bg-neutral-100 shadow-light"
		>
			<!-- works -->
			<Button
				onclick={() => {
					dashboardBookStore.selectedBook = null;
					dashboardBookStore.openCreateBook = true;
				}}
				variant="link"
			>
				Create
			</Button>
		</div>
		<div class="w-fit h-10 mt-5 inline-flex items-center justify-center gap-5">
			<!-- works -->
			<span>Total {books.data?.length}/200 Books</span>
			<!-- 		<BookSelect /> -->
		</div>
		<span class="inline-block ml-1em">
			<Button
				variant="outline"
				onclick={() => {
					openPreview = !openPreview;
				}}
			>
				<SettingsIcon class="inline" /> Previews
			</Button>
		</span>
		<span class="inline-block ml-1em">
			<Button
				variant="outline"
				onclick={() => {
					openMailer = !openMailer;
				}}
			>
				Message Followers
			</Button>
		</span>
		<div class="flex flex-wrap gap-2">
			<Button
				onclick={() => {
					dashboardBookStore.openAddFolderDialog = true;
				}}
				variant="ghost"
			>
				Create Folder
			</Button>
			<div class="flex flex-wrap gap-1 justify-start place-content-center">
				<button
					class="px-5 py-1 font-medium bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm"
					class:border-1={currFolder == 'default'}
					onclick={() => {
						currFolder = 'default';
					}}
				>
					Default-[{groupBookByFolder['default']?.length}]
				</button>
				{#each all_buckets ?? [] as item}
					<button
						class="px-5 py-1 font-medium bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm"
						class:border-1={currFolder == item}
						onclick={() => {
							currFolder = item;
						}}
					>
						{item}
						[{groupBookByFolder[item]?.length}]
					</button>
				{/each}
			</div>
		</div>
		<div class="max-h-[84vh] border-1 mt-3 grow-0 overflow-auto">
			{@render children?.()}
			{#if !children}
				<Table books={groupBookByFolder[currFolder]} />
			{/if}
		</div>
	</div>
</div>
<HeaderBuilt top={false} />
