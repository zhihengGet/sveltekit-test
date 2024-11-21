<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import {
		ValidActions,
		actionToStatus,
		chapter_status,
		statusToActions,
		ActionToIcon
	} from '$lib/data/dbConstants';
	import {
		useScheduleChapter,
		useUpdateChapter,
		useUnScheduleChapter
	} from '$lib/queries';
	import type { chapter, min_chapter } from '$lib/types';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { keys } from '$lib/utils/getKeys';
	import { InkStore } from '../../store.svelte';
	import Popover from '$components/Popover.svelte';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { useCreatePreview } from '$lib/queries/preview/usePreview';
	import Drawer from '$components/Drawer.svelte';
	import Button from '$components/button.svelte';
	//export let data: { [s in action]: min_chapter[] } = [];

	let { data }: { data: { [s in chapter_status]: min_chapter[] } } = $props();

	const update = useUpdateChapter();
	const createPreview = useCreatePreview();
	function handleClick(new_status: chapter_status, chapter: min_chapter) {
		console.log('click', new_status, chapter);
		update.mutate({
			id: chapter.id,
			action: new_status,
			status: new_status
		});
	}
	const scheduler = useScheduleChapter();
	const unscheduler = useUnScheduleChapter();
	let wasClosed = true;
	$effect(() => {
		console.log(
			'effect running',
			InkStore.openChapterSheet && InkStore.chapter && InkStore.chapter.status
		);
		if (
			InkStore.chapter &&
			document &&
			InkStore.openChapterSheet &&
			wasClosed
		) {
			untrack(() => {
				document
					.getElementById(InkStore.chapter!.status)
					?.getElementsByTagName('button')?.[0]
					?.click();
			});

			document.getElementById(InkStore.chapter.id.toString())?.scrollIntoView();
			wasClosed = false;
		}
		return () => {
			wasClosed = InkStore.openChapterSheet;
		};
	});
	let openScheduleModal = $state(false);
	let publishInput = $state({ time: null });
	let selectedChapterSchedule: any = $state({});
</script>

<Accordion.Root class="w-full" type="single">
	{#each chapter_status as item}
		<Accordion.Item value={item} class="w-full" id={statusToActions[item]}>
			<Accordion.Trigger class="capitalize">
				<b>
					{item}
					{data[item]?.length ?? 0}
				</b>
			</Accordion.Trigger>
			<Accordion.Content>
				<span class="text-blue" class:hidden={item != 'trashed'}>
					- Trashed Chapter will be auto cleaned up after 30 days
				</span>
				<span class="text-blue" class:hidden={item != 'published'}>
					- Published chapters are public ! Note: Update Published Chapter can
					lose user comments!
				</span>
				<span class="text-blue" class:hidden={item != 'draft'}>
					- Draft chapters are private including its comments
				</span>
				<!-- sorted in select query -->
				{#each data[item] /* .sort((a, b) => a.sequence - b.sequence) */ || [] as chapter}
					<ol
						class="flex capitalize items-center h-14 truncate list-decimal justify-between"
						class:text-green={InkStore.chapter?.id == chapter.id}
						id={chapter.id.toString()}
					>
						<a href="/ink/{InkStore.book?.id}/{chapter.id}" class="ml-1 w-90%">
							<div
								class="w-full flex"
								class:text-green-800={InkStore.chapter?.id == chapter.id}
							>
								<span class="basis-4/6 truncate font-extrabold">
									{chapter.title}
								</span>
								<span class="text-gray-500 basis-2/6">
									[{chapter.sequence}]
								</span>
							</div>
							<p
								class="text-gray-500 text-sm break-words whitespace-normal"
								class:hidden={chapter.status != 'trashed'}
							>
								Trashed {timeAgo(
									new Date(chapter.user_modified_at).getTime(),
									new Date()
								)}
							</p>
						</a>
						<Popover>
							{#snippet button(builder)}
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<button {...builder}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
									>
										<path
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											d="M3 13v-2h2v2H3Zm8 0v-2h2v2h-2Zm8 0v-2h2v2h-2Z"
										/>
									</svg>
								</button>
							{/snippet}

							{#snippet children()}
								<div class="flex flex-col min-h-20">
									<h4 class="truncate text-md">{chapter.title}</h4>

									<b>current status: {chapter.status}</b>
									<hr />
									{#each ValidActions[chapter.status] as ac}
										<button
											class="h-10 hover:bg-gray-300 capitalize border-1"
											onclick={() =>
												handleClick(actionToStatus[ac.action], chapter)}
										>
											<span class="w-200px">
												{ac.action}
												{ActionToIcon[ac.action]}
											</span>
										</button>
									{/each}
									<a
										target="_blank"
										class="mt-2 h-10 hover:bg-gray-300 capitalize border-1 flex justify-center items-center text-green-800"
										href="/reader/{chapter.book_id}/{chapter.id}"
									>
										Read
									</a>
									<button
										class="h-10 hover:bg-gray-300 capitalize border-1 flex justify-center items-center text-green-900"
										onclick={() => {
											selectedChapterSchedule = chapter;
											openScheduleModal = true;
										}}
									>
										Schedule 🕰
									</button>
								</div>
							{/snippet}
						</Popover>
					</ol>
				{/each}

				<div class:hidden={data[item] != undefined}>Empty</div>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

<Drawer
	bind:open={openScheduleModal}
	title={selectedChapterSchedule?.title}
	description="You chapter will be moved to 'scheduled' status"
>
	{#snippet children()}
		<div>
			<label for="chapter-schedule">
				Enter Publish Date (UTC) <span class="text-green-600">
					{publishInput['time'] ? timeAgo(publishInput['time']) : 0}
				</span>
			</label>
			<input
				id="chapter-schedule"
				type="datetime-local"
				bind:value={publishInput['time']}
			/>
		</div>
	{/snippet}
	{#snippet footer()}
		<Button
			size="sm"
			variant="destructive"
			onclick={() =>
				unscheduler.mutate({ chapter_id: selectedChapterSchedule?.id })}
			isLoading={unscheduler.isPending}
		>
			Unschedule
		</Button>
		<Button
			size="sm"
			isLoading={scheduler.isPending}
			onclick={() =>
				scheduler.mutate({
					chapter_id: selectedChapterSchedule.id,
					time: new Date(publishInput['time']).getTime()
				})}
			disabled={!publishInput['time']}
		>
			Schedule
		</Button>
	{/snippet}
</Drawer>
