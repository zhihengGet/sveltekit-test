<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import PreviewUrlList from '$components/PreviewURLList.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Like from '$lib/icons/like.svelte';
	import { client } from '$lib/queries/api';
	import { CustomError } from '$lib/queries/base/errors';
	import { responseUnwrap } from '$lib/queries/util';
	import type { paginateQuery, user_book_data } from '$lib/types';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		generatePreviewURL,
		useDeletePreview,
		useGetPreviews
	} from '$lib/queries/preview/usePreview';
	import { timeAgo } from '$lib/utils/timeAgo';
	import {
		add,
		addMilliseconds,
		formatDate,
		formatDistance,
		formatDistanceToNow
	} from 'date-fns';
	import PaginateUi from '$lib/components/PaginateUI.svelte';
	import Clock from 'lucide-svelte/icons/clock'
import Copy from 'lucide-svelte/icons/copy'
import X from 'lucide-svelte/icons/x';
	import { toastNotify } from '$lib/utils/toast';
	import { Description } from 'formsnap';
	import type { Snippet } from 'svelte';
	import type { previews } from '$lib/types';
	import Dropdown from '$components/dropdown.svelte';
	import { formatNumber } from '$lib/utils';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	import Textarea from '$components/ui/textarea/textarea.svelte';
	import { SITE_URL } from '$lib/data/constants';
	let {
		book_id,
		openDialog = $bindable(false)
	}: { book_id: number; openDialog: boolean } = $props();
	let open = $state(false);
	let pager: PaginateUi = $state({});
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

	const readers = (
		args: paginateQuery<user_book_data & { username: string }>
	) =>
		createQuery(() => {
			return {
				queryKey: ['beta readers', args],
				queryFn: async () => {
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

	let link = $state('');
	const fn = createMutation(() => { return {
		mutationFn: async () => {
			const res = await client.rest.api.betareader.protected.email.$post({
				json: {
					book_id: book_id,
					ids: Array.from(selected),
					url: link,
					words: words
				}
			});
			const r = await res.json();
			if (res.status != 200) throw new CustomError(r.message);

			return r;
		},
		meta: {
			toast: true
		}
	} });
</script>

<!--
// v0 by Vercel.
// https://v0.dev/t/mIlOWiC9oCb
-->

<div class="container mx-auto px-4 md:px-6 py-12">
	<div class="flex flex-col gap-8">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Select Users</h1>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<label
						class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm"
						for="custom-url"
					>
						Custom URL:
					</label>
					<input
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-xs"
						id="custom-url"
						placeholder="https://example.com/users"
						type="text"
					/>
				</div>
				<button
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
				>
					Send Email
				</button>
			</div>
		</div>
		<div
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
		>
			<Input
				placeholder="Search by user name"
				oninput={(e) => pager?.deb(e.target.value)}
			/>

			<PaginateUi
				bind:this={pager}
				useQuery={readers}
				filter={{ book_id: 170 }}
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
					<div class="grid grid-cols-4">
						{#each res || [] as reader}
							<div
								class="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-4"
								data-v0-t="card"
							>
								<div class="flex items-center gap-4">
									<span
										class="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12"
									>
										<img
											class="aspect-square h-full w-full"
											src="/placeholder-user.jpg"
											alt="User 10"
										/>
									</span>
									<div class="flex-1">
										<div class="font-medium">User 10</div>
										<div class="text-sm text-muted-foreground">174 likes</div>
									</div>
									<button
										type="button"
										role="checkbox"
										aria-checked="false"
										data-state="unchecked"
										value="on"
										class="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
										id="user-9"
									></button>
								</div>
							</div>
							<div class="truncate">
								<input
									type="checkbox"
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
							<div>
								<Like class="inline" />
								{formatNumber(reader.like_count)}
							</div>
							<div class="text-[0.8rem] col-span-2 truncate">
								⌚last visited {timeAgo(reader.updated_at ?? '2000')}
							</div>
						{/each}
					</div>
				{/snippet}
			</PaginateUi>
		</div>
	</div>
</div>

<h1>Preview Statistics</h1>
