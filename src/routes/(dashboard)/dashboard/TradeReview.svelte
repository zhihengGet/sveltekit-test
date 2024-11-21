<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Switch from '$components/ui/switch/switch.svelte';
	import { useGetBookConfig } from '$lib/queries';
	import { client } from '$lib/queries/api';
	import { useUpdateBookConfig } from '$lib/queries/book/mutate/updateConfig';
	import type {
		book,
		paginateQuery,
		previews,
		trade_reviews
	} from '$lib/types';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import type { book_setting } from '../../(api)/rest/bookApp.server';
	import { debounce } from '@melt-ui/svelte/internal/helpers';
	import isEqual from 'lodash-es/isEqual';
	import Input from '$components/ui/input/input.svelte';
	import { isAfter, isBefore } from 'date-fns';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { COMMENT_EMAIL_THROTTLER } from '$lib/data/constants';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import PaginateUi from '$components/PaginateUI.svelte';
	import PreviewDropdown from './PreviewDropdown.svelte';
	import BookSelect from './BookSelect.svelte';
	import { dashboardBookStore } from './BookStore.svelte';
	import { getPreviewSessionIdAsync } from '$lib/queries/preview/usePreview';

	let { book, open = $bindable(false) }: { book: book | null; open: boolean } =
		$props();

	let getRecords = (data: paginateQuery<trade_reviews>) =>
		createQuery(() => {
			return {
				queryKey: [],
				queryFn: async () => {}
			};
		});
	const create = createMutation(() => {
		return {
			mutationFn: async () => {
				console.log(preview_url);
				const data =
					await client.rest.api.tradereview.protected.start_trade_reviews.$post(
						{
							json: {
								preview_id: preview.id,
								preview_id_opponent: (
									await getPreviewSessionIdAsync(preview_url)
								).id,
								book_id: book.id
							}
						}
					);
			}
		};
	});
	const up = useUpdateBookConfig();
	let preview_url: string = $state(
		'http://127.0.0.1:5173/book/36?preview_session_id=11b938cf-da81-4bf8-b5be-e8712e50e2a9'
	);
	let preview: previews | null = $state();
	let type: 'create' | 'list' | 'InProgress' = $state('create');
</script>

<Drawer
	bind:open
	title={book?.title}
	description="Please put thoughts into your reviews! You can only see the review after you reviewed other trader's book"
>
	{#snippet children()}<Menubar.Root>
			<Menubar.Menu>
				<Menubar.Trigger>Create</Menubar.Trigger>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>InProgress</Menubar.Trigger>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Completed</Menubar.Trigger>
			</Menubar.Menu>
		</Menubar.Root>
		{#if type === 'create'}
			<p class="text-sm">
				PreviewId acts as an agreement bewteen the two of you, trade records
				persist after preview expire!
			</p>
			<Label>Enter preview id of the book you want to trade review with</Label>
			<Input class="" placeholder="preview_url" bind:value={preview_url} />
			<PreviewDropdown
				book_id={book.id}
				text="Select a preview url to share"
				bind:selectedPreview={preview}
			/>
		{/if}
		{#if type === 'InProgress'}
			<PaginateUi useQuery={getRecords}></PaginateUi>
		{/if}
	{/snippet}
	{#snippet footer()}
		<Button
			onclick={() => {
				create.mutate();
			}}
		>
			Submit
		</Button>
	{/snippet}
</Drawer>
