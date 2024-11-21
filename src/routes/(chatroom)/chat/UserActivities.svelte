<script lang="ts">
	import { client } from '$lib/queries/api';
	import { responseUnwrap } from '$lib/queries/util';
	import { createQueries } from '@tanstack/svelte-query';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Spinner from '$lib/icons/spinner.svelte';
	import Oval from '$lib/icons/loader/oval.svelte';
	import { chatStore } from './store.svelte';
	import type { book, chapter } from '$lib/types';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import Link from 'lucide-svelte/icons/link';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Button from '$components/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Text from '$components/text.svelte';
	let { users = [] }: { users: { user_id: string; name: string }[] } = $props();

	// const data = createQueries({
	// 	queries: () =>
	// 		users.map((v) => {
	// 			return {
	// 				queryKey: ['activities', v.user_id],
	// 				queryFn: async () => {
	// 					const data = await client.rest.api.self.protected.activities[
	// 						':user'
	// 					].$get({ param: { user: v.user_id } });

	// 					return responseUnwrap(data);
	// 				}
	// 			};
	// 		}),
	// 	combine: (results) => {
	// 		console.warn('results', results);
	// 		return {
	// 			data: Object.groupBy(
	// 				results
	// 					.map((result) =>
	// 						result.data ? Object.values(result.data ?? []).flat() : []
	// 					)
	// 					.flat(),
	// 				(v) => v.target_user_id
	// 			),
	// 			pending: results.some((result) => result.isLoading)
	// 		};
	// 	}
	// });
	const activities = createQueries({
		queries: () =>
			users.map((v) => {
				return {
					queryKey: ['activities', v.user_id],
					queryFn: async () => {
						const data = await client.rest.api.self.protected.recent_creation[
							':user'
						].$get({ param: { user: v.user_id } });

						return responseUnwrap(data) as unknown as (book & {
							chapters: chapter[];
						})[];
					}
				};
			}),
		combine: (results) => {
			console.warn('results', results);
			return {
				data: Object.groupBy(
					results.map((result) => result.data || []).flat(),
					(v) => v.author_id
				),
				pending: results.some((result) => result.isLoading)
			};
		}
	});
	let user_ids = $derived(Object.keys(activities.data));
	let usernames = $derived(
		users.reduce((prev, curr) => {
			prev[curr.user_id] = curr.name;
			return prev;
		}, {})
	);
	$inspect(usernames, 'usernames');
</script>

<!-- {JSON.stringify(data)} -->
<Accordion.Root type="multiple" class="w-full">
	{#if activities.pending}
		<Spinner />
	{/if}
	{#each user_ids as i (i)}
		<Accordion.Item value={i}>
			<Accordion.Trigger class="bg-amber-50 mb-2">
				{usernames[i]}
			</Accordion.Trigger>
			<Accordion.Content class="max-h-500px overflow-auto p-1  ">
				<h1>
					Latest 3 Books...
					<a href="/profile/{i}">more</a>
				</h1>
				{#each activities.data[i] ?? [] as event, index}
					<Collapsible.Root class="w-[350px] space-y-2">
						<div class="flex items-center justify-between space-x-4 px-4">
							<h4
								class="text-md color-blue-900 font-semibold truncate capitalize"
							>
								<a href="/book/{event.id}">
									{index}. [{event.category}] [#{event.chapter_count}] {event.title}<Link
										class="inline ml-2 align-top"
										size={16}
									/>
								</a>
								<!-- <a href="/book/{event.id}"><Link class="inline" size={16} /></a> -->
							</h4>
							<Collapsible.Trigger
								class={buttonVariants({
									variant: 'ghost',
									size: 'sm',
									class: 'w-9 p-0'
								})}
							>
								<ChevronsUpDown class="size-4" />
								<span class="sr-only">Toggle</span>
							</Collapsible.Trigger>
						</div>
						<!-- <div class="rounded-md border px-4 py-3 font-mono text-sm truncate">
							{event.summary}
						</div> -->
						<Collapsible.Content class="space-y-2 ml-2 p-1">
							<div>
								{#each event.tags as tag}
									<Badge class="m-1">{tag}</Badge>
								{/each}
							</div>
							<div>
								<Text
									class=""
									wordLimit={200}
									enableMore={true}
									text={event.summary}
								></Text>
							</div>
							<!-- chapter list -->
							<div></div>
						</Collapsible.Content>
					</Collapsible.Root>
					<!-- <Accordion.Root type="single" class="w-full ">
						<Accordion.Item value="item-1">
							<Accordion.Trigger>
								Book 《{event.title}》[{event.category}]
							</Accordion.Trigger>
							<Accordion.Content>
								{#each event.tags as tag}
									<Badge class="m-1" size="sm">{tag}</Badge>
								{/each}
								<div class="mt-2">
									<Text text={event.summary} wordLimit={100} enableMore={true}
									></Text>
								</div>
								<h4 class="color-blue font-500">Chapter list</h4>
								{#each event.chapters as chapter}
									<Collapsible.Root class="w-[250px] space-y-2">
										<div
											class="flex items-center justify-between space-x-4 px-4"
										>
											<Collapsible.Trigger
												class={buttonVariants({
													variant: 'ghost',
													size: 'sm',
													class: 'w-fit p-0'
												})}
											>
												<div class="w-full flex">
													<ChevronsUpDown class="size-4 " />
													<span class="max-w-6/10 truncate">
														{chapter.sequence}. {chapter.title} 
													</span>
												</div>
											</Collapsible.Trigger>
										</div>
										<Collapsible.Content class="space-y-2">
											<div
												class="rounded-md border px-4 py-3 font-mono text-sm"
											>
												<p class="text-sm text-gray">
													Created At {chapter.created_at?.split('T')[0]}
												</p>
												<Button
													variant="secondary"
													size="sm"
													class="/reader/{event.id}/{chapter.id}"
												>
													Read
												</Button>
											</div>
										</Collapsible.Content>
									</Collapsible.Root>
								{/each}
								{#if event.chapters.length == 0}
									<div class="ml-2 color-gray">No Chapters</div>
								{/if}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root> -->
				{/each}
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
