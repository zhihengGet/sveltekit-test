<script lang="ts">
	import Button from '$components/button.svelte';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import type { book, bookWithUserInfo } from '$lib/types';
	import { formatNumber } from '$lib/utils';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { compareDesc } from 'date-fns';
	import { dashboardBookStore, selectEditBook } from './BookStore.svelte';
	import Folder from './FolderOrganizeButton.svelte';
	import RemoveBookConfirm from './RemoveBookConfirm.svelte';
	import Input from '$components/ui/input/input.svelte';
	import BetaReader from './BetaReader.svelte';
	import uFuzzy from '@leeoniya/ufuzzy';
	import ViewerComment from './ViewerComment.svelte';
	import ConfigDrawer from './ConfigDrawer.svelte';
	import Link from 'lucide-svelte/icons/link';
	import MessageMailer from './MessageMailer.svelte';
	import MessageBook from './MessageBook.svelte';
	let { books }: { books: bookWithUserInfo[] } = $props();
	let checked = $state(false);
	let opts = {
		unicode: true, // case-insensitive regexps
		intraIns: 1
	};
	let selected: book | null = $state();
	let openComm = $state(false);
	let openInvite = $state(false);
	let openConfig = $state(false);
	let openTrader = $state(false);
	let openStates = $state({ mailer: false });
	let uf = new uFuzzy(opts);

	//let filterStatus = $state('');
	let curr = $derived(
		books
			?.filter((v) => v.is_visible == !checked)
			.toSorted((a, b) => compareDesc(a.user_modified_at, b.user_modified_at))
	);

	let openPopover: any = $state({});
	let openDelAlert = $state(false);
	let filter = $state('');
	let titles = $derived(curr.map((v) => v.title + ' ' + v.status));
	const filteredBooks = $derived.by(
		() => {
			if (filter.length == 0) return curr;
			let needle = filter;
			let idxs = uf.filter(titles, needle);
			let info = uf.info(idxs, titles, needle);
			let order = uf.sort(info, titles, needle);
			console.log('filtered', order);
			return order.map((v) => curr[idxs[v]]) as book[];
		}
		/* curr?.filter((v) => {
			if (
				v.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
				v.status.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
			) {
				return true;
			}
			return false;
		}) */
	);
	const colors = {
		archived: '#95ADB6',
		completed: '#1a2e05',
		ongoing: '#a3e635',
		draft: '#fde047'
	};
</script>

{#if dashboardBookStore.selectedBook}
	<RemoveBookConfirm
		bind:open={openDelAlert}
		book={dashboardBookStore!.selectedBook}
	/>
{/if}

<div class="w-[1800px] min-h-screen relative">
	<div class="p-4 w-1/4">
		<Input
			bind:value={filter}
			placeholder="Filter by status or title, case sensitive"
		/>
	</div>

	<div class="flex items-center space-x-2 m-2">
		<input
			type="checkbox"
			id="terms"
			onclick={(e) => {
				checked = !checked;
			}}
			aria-labelledby="Toggle Hidden Chapters"
		/>
		<Label
			id="terms-label"
			for="terms"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
		>
			Showing {checked ? 'hidden' : 'public'}
			<b class="text-blue">{curr?.length ?? 0}</b>
			Books
		</Label>
	</div>

	<div class="w-[1800px] h-13 grid grid-cols-13 justify-items-center relative">
		<div class="col-span-1">Literature</div>
		<div class="col-span-1">Status</div>
		<div class="col-span-1">Created At</div>
		<div class="col-span-1">Published Chapters</div>
		<div class="col-span-1">Count</div>
		<div class="col-span-1 capitalizea">Clicks</div>
		<div class="col-span-1 capitalize">Edit</div>
		<div class="col-span-1">Folder</div>
		<div class="col-span-1">Invitation</div>
		<div class="col-span-1">Config</div>
		<div class="col-span-1">Read</div>
		<div class="col-span-1">Comments</div>
		<div class="col-span-1">Message</div>
		<!-- <div class="col-span-1">Trade</div> -->
	</div>
	<div class="w-[1800px] grid grid-cols-13 gap-y-5 text-center">
		{#each filteredBooks ?? [] as book (book.id)}
			<a href="/ink/{book.id}" class="border-b-1">
				<figure class="flex flex-col relative items-center">
					<img
						src={book.cover_url}
						class="text-[12px]"
						width="100"
						height="100"
						data-url={book.cover_url}
						alt="Invalid URL"
						onerror={(e) => {
							e.onerror = null;
							e.target.classList.add('bg-gray-100');
							e.target.src =
								'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
						}}
					/>
					<figcaption class="w-85% truncate self-center text-center">
						{book.title}
					</figcaption>
				</figure>
			</a>
			<div class="border-b-1 capitalize text-[0.8em]">
				<div
					class="w-3 h-3 rounded-full inline-block"
					style="background-color: {colors[book.status]};"
				></div>

				{book.status}
			</div>
			<div class="border-b-1 capitalize text-[0.8em] whitespace-break-spaces">
				{timeAgo(book.created_at)}
			</div>
			<div class="border-b-1 text-center">
				{JSON.stringify(book.chapter_count)}
			</div>
			<div class="border-b-1">
				{formatNumber(book.word_count)}
			</div>
			<div>{book.total_click}</div>
			<div>
				<Popover.Root
					onOpenChange={() => {
						openPopover[book.id];
					}}
					controlledOpen={true}
					open={openPopover[book.id]}
				>
					<Popover.Trigger>
						<Button
							variant="outline"
							onclick={() => {
								openPopover[book.id] = true;
							}}
						>
							Edit
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-80 z-51">
						<div class="grid gap-4 w-full">
							<div class="grid w-full">
								<h4 class="font-medium leading-none">Edit {book.title}</h4>
								<!-- <p
									class="text-sm text-muted-foreground text-ellipsis inline-block whitespace-break-spaces"
								>
									Sorry, you cant delete your book right now :(
								</p> -->
							</div>
							<div class="grid gap-2">
								<div class="grid grid-cols-1 items-center gap-4">
									<!-- <Label for="height">Modify</Label> -->
									<Button
										id="height"
										onclick={() => {
											selectEditBook(book);
											openPopover[book.id] = false;
											dashboardBookStore.openCreateBook = true;
										}}
										value="25px"
										class="col-span-2 h-8"
									>
										Modify
									</Button>
								</div>
								<div class="grid grid-cols-1 items-center gap-4">
									<!-- <Label for="maxHeight">Hide</Label> -->
									<Button
										id="maxHeight"
										onclick={() => {
											selectEditBook(book);
											openPopover[book.id] = false;
											openDelAlert = true;
										}}
										value="none"
										class="col-span-2 h-8"
									>
										{!checked ? 'Hide' : 'Publish'}
									</Button>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="border-b-1"><Folder {book} /></div>
			<div>
				<Button
					variant="secondary"
					onclick={() => {
						selected = book;
						openInvite = !openInvite;
					}}
				>
					Invite
				</Button>
			</div>
			<div>
				<Button
					variant="secondary"
					onclick={() => {
						openConfig = !openConfig;
						selected = book;
					}}
				>
					Config
				</Button>
			</div>
			<div>
				<Button variant="ghost" href="/book/{book.id}">
					<Link size={10} class="mr-1" /> Read
				</Button>
			</div>
			<div>
				<Button
					variant="ghost"
					onclick={() => {
						openComm = !openComm;
						selected = book;
					}}
				>
					Comments
				</Button>
			</div>
			<div>
				<Button
					variant="ghost"
					onclick={() => {
						openStates.mailer = !openStates.mailer;
						selected = book;
					}}
				>
					Message
				</Button>
			</div>
			<!-- 	<div>
				<Button
					variant="ghost"
					onclick={() => {
						openTrader = !openTrader;
						selected = book;
					}}
					disabled={book.is_visible === false}
				>
					Trade
				</Button>
			</div> -->
		{/each}
	</div>
</div>
<BetaReader bind:open={openInvite} book={selected} book_id={selected?.id} />
<ConfigDrawer bind:open={openConfig} book={selected} />
<ViewerComment bind:open={openComm} book={selected} />

<MessageBook bind:open={openStates['mailer']} book={selected} />
<!-- <TradeReview bind:open={openTrader} book={selected} /> -->
