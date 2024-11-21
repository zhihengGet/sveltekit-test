<script lang="ts">
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
	import PaginateUi from './PaginateUI.svelte';
	import Button from './button.svelte';
	import { toastNotify } from '$lib/utils/toast';
	import type { Snippet } from 'svelte';
	import type { previews } from '$lib/types';

	let {
		book_id,
		chapter_id,
		render,
		mode = 'card',
		showDeleteButton = true
	}: {
		book_id: number;
		chapter_id?: number;
		render?: Snippet<[previews]>;
		mode?: 'card' | 'simple';
		showDeleteButton?: boolean;
	} = $props();
	const del = useDeletePreview();
</script>

{#snippet Simple(preview)}
	<div>
		<span class="w-2/3">{preview.description}</span>
		<span class="w-1/3">{preview.ttl} hour(s)</span>
	</div>
{/snippet}

<PaginateUi
	useQuery={useGetPreviews}
	filter={{ book_id, chapter_id }}
	paginate={{ start: 0, end: 10, size: 10 }}
>
	{#snippet children(data)}
		{#if showDeleteButton}
			<Button
				isLoading={del.isPending}
				variant="outline"
				class="bg-gradient-to-r from-red-100"
				onclick={() => {
					const r = confirm(
						'Are you sure you want to delete all preview links ?'
					);
					if (r) del.mutate({ book_id: book_id });
				}}
			>
				Delete all preview url in this book
			</Button>
		{/if}

		<div class="">
			{#each data as preview}
				{@const expiredText = formatDistance(
					addMilliseconds(new Date(preview.created_at), preview.ttl * 3600000),
					new Date(),
					{ addSuffix: true }
				)}
				{@const hasExpired = expiredText.startsWith('about')}
				{@render render?.(preview)}
				{#if mode === 'card' && !render}
					<span
						class="flex flex-col border-1 p-3 my-2 shadow-md {hasExpired
							? ''
							: 'bg-green-50'}"
					>
						<div class="hidden">
							<div>
								<h3
									class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight"
								>
									{preview.chapter_id ? 'Single Chapter' : 'All Chapters'}
								</h3>
							</div>

							<div class="p-6 grid gap-2">
								<div class="flex items-center justify-between">
									<div class="text-sm text-muted-foreground">Created at</div>
									<div class="text-sm">
										{formatDate(preview.created_at, 'yyyy-MM-dd')}
									</div>
								</div>
								<div class="flex items-center justify-between">
									<div class="text-sm text-muted-foreground">Name</div>
									<div class="text-sm">{preview.name}</div>
								</div>
								<div class="flex items-center justify-between">
									<div class="text-sm text-muted-foreground">Duration</div>
									<div class="text-sm">{preview.ttl} hour(s)</div>
								</div>
								<div class="flex items-center justify-between">
									<div class="text-sm text-muted-foreground">Expire</div>
									<div class="text-sm">{expiredText}</div>
								</div>
								<div class="flex items-center justify-between">
									<div class="text-sm text-muted-foreground">Description</div>
									<div class="text-sm">{preview.description ?? 'No Data'}</div>
								</div>
							</div>
							<span class="">
								<a href={generatePreviewURL(preview)} class="text-blue">View</a>
								<Button
									variant="ghost"
									onclick={(e) => {
										e.preventDefault();
										navigator.clipboard.writeText(generatePreviewURL(preview));
										toastNotify.success('copied');
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-4 w-4"
									>
										<rect
											width="14"
											height="14"
											x="8"
											y="8"
											rx="2"
											ry="2"
										></rect>
										<path
											d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
										></path>
									</svg>
									<span class="sr-only">Copy</span>
								</Button>
								<Button
									variant="ghost"
									class="hover:text-blue"
									isLoading={del.isPending}
									onclick={() => {
										del.mutate(preview);
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-4 w-4"
									>
										<path d="M3 6h18"></path>
										<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
										<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
									</svg>
									<span class="sr-only">Delete</span>
								</Button>
							</span>
						</div>
						<div class="flex flex-col space-y-1.5 p-6">
							<h3
								class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight"
							>
								{preview.chapter_id ? 'Single Chapter' : 'All Chapters'}
							</h3>
							<div class="text-sm text-muted-foreground">
								<div
									class="flex items-center gap-2 text-sm text-muted-foreground"
								>
									<div>
										Created at: {formatDate(preview.created_at, 'yyyy-MM-dd')}
									</div>
									<div
										data-orientation="vertical"
										role="none"
										class="shrink-0 bg-border w-[1px] h-4"
									></div>
									<div>Duration: {preview.ttl} hour(s)</div>
									<div
										data-orientation="vertical"
										role="none"
										class="shrink-0 bg-border w-[1px] h-4"
									></div>
									<div>Expire: {expiredText}</div>
								</div>
							</div>
						</div>
						<div class="p-6">
							<p class="text-sm text-muted-foreground">
								{preview.description}
							</p>
						</div>
						<div class="p-6 flex items-center justify-end gap-2">
							<button
								class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
								disabled={del.isPending}
								onclick={() => {
									del.mutate(preview);
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
								</svg>
								<span class="sr-only">Delete</span>
							</button>
							<button
								class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
								onclick={(e) => {
									e.preventDefault();
									navigator.clipboard.writeText(generatePreviewURL(preview));
									toastNotify.success('copied');
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
									<path
										d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
									></path>
								</svg>
								<span class="sr-only">Copy</span>
							</button>
							<a
								href={generatePreviewURL(preview)}
								class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
							>
								Jump
							</a>
						</div>
					</span>
				{/if}
			{/each}
		</div>
	{/snippet}
</PaginateUi>
