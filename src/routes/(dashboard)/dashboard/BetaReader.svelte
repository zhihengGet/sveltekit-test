<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import { batchSendBetaReadMailHTML } from '$components/email_template/email';
	import PreviewUrlList from '$components/PreviewURLList.svelte';
	import Input from '$components/ui/input/input.svelte';
	import PaginateUi from '$lib/components/PaginateUI.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import BookSelect from '$lib/composite/BookSelect.svelte';
	import { SITE_URL } from '$lib/data/constants';
	import Like from '$lib/icons/like.svelte';
	import { client } from '$lib/queries/api';
	import { CustomError } from '$lib/queries/base/errors';
	import { responseUnwrap } from '$lib/queries/util';
	import { user } from '$lib/state/runes.svelte';
	import type {
		book,
		min_chapter,
		paginateQuery,
		previews,
		user_book_data
	} from '$lib/types';
	import { formatNumber } from '$lib/utils';
	import { sleep } from '$lib/utils/sleep';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { toastNotify } from '$lib/utils/toast';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import localforage from 'localforage';
	import Send from 'lucide-svelte/icons/send';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { SvelteSet } from 'svelte/reactivity';
	let {
		book_id,
		chapter,
		openDialog = $bindable(false),
		book,
		mode = 'book',
		open = $bindable(false)
	}: {
		book_id: number;
		openDialog: boolean;
		book: book;
		chapter?: min_chapter;
		mode: 'book' | 'chapter'; // chapter or book level invite
		open: boolean;
	} = $props();
	//let open = $state(false);
	let pager: PaginateUi | {} = $state({});
	let selected: SvelteSet<string> = new SvelteSet([]);

	let selectFirst20 = $state(false);
	$effect(() => {
		let result = pager?.queryResult?.data;
		console.log('result', result);
		if (!result) return;
		if (selectFirst20) {
			for (let x of result) {
				selected.add(x.id);
			}
		} else {
			for (let x of result) {
				selected.delete(x.id);
			}
		}
	});
	let filters = $state({ accepted_reader: null, is_beta_reader: null });
	let words = $state('');
	let apiKey = $state();
	const emailed_count = createQuery(() => {
		return {
			queryKey: ['beta reader review invitation count'],
			queryFn: async () => {
				const data =
					await client.rest.api.betareader.protected.emailed_count_today.$get();
				return responseUnwrap(data);
			}
			//refetchInterval: 60000
		};
	});
	const readers = (
		props: () => paginateQuery<user_book_data & { username: string }>
	) =>
		createQuery(() => {
			return {
				queryKey: ['beta readers', props()],
				queryFn: async () => {
					const args = props();
					const res =
						await client.rest.api.betareader.protected.get_readers.$post({
							json: {
								book_id: book_id,
								start: args.paginate.start,
								end: args.paginate.end,
								username: args.search?.regex,
								is_beta_reader: args.filter.is_beta_reader,
								accepted_reader: args.filter.accepted_reader
							}
						});
					const r = await res.json();
					if (res.status != 200) throw new CustomError(r.message);
					return r;
				}
			};
		});
	const fn = createMutation(() => { return {
		mutationFn: async () => {
			const res = await client.rest.api.betareader.protected.email.$post({
				json: {
					book_id: book_id,
					chapter_id: chapter?.id,
					ids: Array.from(selected),
					words: words,
					preview_id: selectedPreview?.id
				}
			});
			const r = await res.json();

			if (r.success)
				toastNotify.success(
					'Successfully emailed ' + r.success + ' brave beta user(s)!'
				);
			if (r.invalid_message && r.invalid)
				toastNotify.error(
					r?.invalid_message ??
						"Oops! We couldn't email " +
							r.invalid +
							' users to avoid sending too many messages. Please try again tomorrow!'
				);
			//@ts-expect-error types
			if (res.status != 200) throw new CustomError(r?.message);

			return r;
		},
		meta: {
			toast: false
		},
		onSuccess: async () => {
			sleep(5000).then((v) => {
				emailed_count.refetch();
			});
		}
	} });
	let selectedPreview: previews | null = $state(null);
</script>

<Drawer
	bind:open
	title={`Invite Readers`}
	description={`${book.title} -  You can only send email to 20 users per day !`}
	class="p-5"
>
	<div class="max-h-50vh overflow-y-auto p-2">
		<h2 class="font-mono w-fit px-1 my-1 rounded text-amber-600 border-b-1">
			Today you have emailed: <span class="text-amber-800 p-0 m-0">
				{emailed_count.data?.count}
			</span>
			/20 user(s)
		</h2>
		<h1 class="text-sm">
			This feature might not work well due to our small, growing user base. Your
			invitation request could be rejected because we can't overwhelm our users
			with emails. Help us grow by sharing with your family and amigos!
		</h1>
		<h1
			class="leading-none text-md font-medium line-height-loose {mode === 'book'
				? ''
				: ''}"
		>
			Step 1: Select an preview url(optional)
		</h1>
		{#if mode === 'chapter'}
			<BookSelect
				selectedBook={book}
				bind:selectedChapter={chapter}
				chapterFil={{}}
			/>{/if}

		<hr />
		{#if mode === 'book' || chapter?.status === 'draft'}
			<div class=" shadow">
				<h1 class="font-light text-sm mt-3 line-height-relaxed p-3">
					Extra: Select an preview url to allow users to read both
					<strong>
						<pre class="inline">Draft/Published</pre>
					</strong>
					chapters
				</h1>
				<Popover.Root>
					<Popover.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							class="w-full justify-between"
						>
							{selectedPreview?.name ??
								'Select a preview url for full-read access'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-9/10 p-1">
						<PreviewUrlList
							showDeleteButton={false}
							{book_id}
							chapter_id={chapter?.id || undefined}
						>
							{#snippet render(data)}
								<div class="flex p-3">
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
									<div class="w-1/5 text-center border-1">
										{formatNumber(data.ttl)} hours
									</div>
								</div>
							{/snippet}
						</PreviewUrlList>
					</Popover.Content>
				</Popover.Root>
			</div>
		{/if}

		<div class="my-3 border-b-1 text-sm">
			<!-- <div>
				<input
					type="checkbox"
					oninput={() => {
						console.log(pager.pageStore);
						let filter = pager?.pageStore?.filter;
						if (filter) filter.accepted_reader = !filter.accepted_reader;
					}}
				/>
				<label for="requested_reader">
					Only display the readers you have previously invited.
				</label>
			</div> -->
		</div>

		<div class="my-2 flex flex-col gap-3">
			<!-- 	<h1 class="font-600 text-md mt-5">
				Step 1: Select 20 or less users(
				<span class="text-sm">Selected:{selected.size})</span>
			</h1> -->
			<h3 class="leading-none text-md font-medium line-height-loose">
				Step 2: Select Users
				<p class="text-muted-foreground text-sm">
					You can select up to 20 users per day.
					<span class="text-sm">. No spam Please.</span>
				</p>
			</h3>
			<div>
				<input
					type="checkbox"
					oninput={() => {
						console.log(pager.pageStore);
						let filter = pager?.pageStore?.filter;
						if (filter) filter.is_beta_reader = !filter.is_beta_reader;
					}}
				/>
				<label for="requested_reader" class="text-sm">
					Only display the reader who requested to be a beta reader.
				</label>
			</div>
			<Input
				placeholder="Search by user name"
				oninput={(e) => pager?.deb(e.target?.value)}
			/>

			<PaginateUi
				bind:this={pager}
				useQuery={readers}
				filter={{ book_id }}
				paginate={{ start: 0, end: 20, size: 20 }}
			>
				{#snippet children(res)}
					<div>
						<input
							type="checkbox"
							oninput={() => (selectFirst20 = !selectFirst20)}
						/>
						<label for="requested_reader">Select All In This Page</label>
					</div>
					<div class="grid grid-cols-5 w-auto overflow-x-auto gap-1 capitalize">
						<div>Name</div>
						<div><Send size={12} class="inline" />Limit</div>
						<div>Like</div>
						<div class="col-span-2">Book Visit Date</div>
					</div>
					<div class="grid grid-cols-5 w-fit overflow-x-auto gap-1">
						{#each res || [] as reader}
							<div class="truncate">
								<input
									type="checkbox"
									checked={selected.has(reader.id)}
									oninput={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (selected.has(reader.id)) {
											selected.delete(reader.id);
										} else {
											selected.add(reader.id);
										}
									}}
								/>
								{reader.username}
							</div>
							<span class="border-b-amber">
								{reader.author_invitation_count}
							</span>
							<div>
								<Like class="inline" />
								{formatNumber(reader.like_count)}
							</div>
							<div class="text-[0.8rem] col-span-2 truncate">
								⌚{timeAgo(reader.updated_at ?? '2000')}
							</div>
						{/each}
					</div>
				{/snippet}
			</PaginateUi>
		</div>

		<!-- 	<div class="font-600 text-md mt-5">
			<div class="capitalize mt-2">
				Step 2: select a preview URL For This Book
			</div>

			<Input
				placeholder="Enter the url the preview url you generated"
				class="font-normal"
				bind:value={link}
			/>
		</div> -->
		<div class="leading-none text-md font-medium line-height-loose mt-10">
			Step 3: Add warm message
			<span class="text-sm">(max 300)</span>
			<textarea
				maxlength="300"
				bind:value={words}
				class="border-1 block font-400 py-2 w-full min-h-100px px-2 text-sm"
				placeholder="A gentle invitation: By default, we will include the first 200 characters of the book description in your email."
			></textarea>
		</div>

		<p class="font-semibold capitalize mt-10">Step 3: Submit !</p>
		<!-- 		<div class="font-600 text-md mt-5">
			<Accordion.Root class="w-full sm:max-w-[90%]" value="item-1">
				<Accordion.Item value="item-1">
					<Accordion.Trigger>Advanced: Link Tracker</Accordion.Trigger>
					<Accordion.Content>
						<div class="p-1">
							How this works:
							<p>
								dub.to will create a new link from your preview URL. When a beta
								reader clicks this link, they'll first go to dub.to to count
								clicks, then be redirected to forkread.com. No API keys are
								stored; they are cleared when the tab is closed.
							</p>
						</div>

						<ol class="list-inside mt-1 font-normal">
							<li>
								1. Go to third party service <Button
									variant="link"
									class="px-0"
									href="https://dub.co/features/branded-links"
								>
									dub.to
								</Button>
								and sign up
							</li>
							<li>
								2. Go to <b>dashboard</b>
								then create an workspace (you can name your workspace anything!)
							</li>
							<li>
								3. Enter your workspace then click on <b>Settings</b>
							</li>
							<li>
								4. Click on <b>API Keys</b>
								then click
								<b>Create button</b>
								create your key(Select permission All or )
							</li>
						</ol>
						<Input
							bind:value={words}
							placeholder="Enter your dub.to API token"
						/>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div> -->
	</div>
	<!-- <p class="text-sm">
		when beta readers submit their review you won't be notified as of
		now(work in progress)
	</p> -->
	{#snippet footer()}
		<a
			href="/dashboard/email_template"
			target="_blank"
			id="email_template"
			class="hidden"
		>
			view email template
		</a>
		<Button
			isLoading={fn.isPending}
			onclick={() => {
				localforage.setItem(
					'email_template',
					batchSendBetaReadMailHTML({
						to: 'Sample User',
						author: user.username,
						book_id: book_id,
						description: book.summary,
						book_name: 'BookName',
						url: SITE_URL + '/reader/' + book_id + '/-1',
						words: 'hi',
						cover_url: 'https://placehold.co/600x400'
					})
				);
				document.getElementById('email_template')?.click();
			}}
		>
			Preview Email
		</Button>
		<Button
			isLoading={fn.isPending}
			onclick={() => fn.mutate()}
			disabled={selected.size > 20 || selected.size == 0}
		>
			Send
		</Button>
	{/snippet}
</Drawer>
