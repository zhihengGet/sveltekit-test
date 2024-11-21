<script lang="ts">
	import ChapterLike from './echart/ChapterLike.svelte';
	import ReviewChart from './echart/RatingChart.svelte';
	import { dashboardBookStore } from '../BookStore.svelte';
	import BookSelect from '../BookSelect.svelte';
	import { default as BoookChapterSelect } from '$lib/composite/BookSelect.svelte';
	import VisitorCount from './echart/VisitorCount.svelte';
	import Referrer from './echart/Referrer.svelte';
	import AgeGroupDist from './echart/AgeGroupDist.svelte';
	import IndustryDist from './echart/IndustryDist.svelte';
	import HeatCount from './echart/Heat.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import PreviewUrlBarGraph from './echart/PreviewUrlBarGraph.svelte';
	import PreviewDailyClick from './echart/PreviewDailyClick.svelte';
	import PreviewDropdown from '../PreviewDropdown.svelte';
	import Input from '$components/ui/input/input.svelte';

	const graphs = [
		'chapter like graph',
		'referrer',
		'review_rating',
		'industry',
		'age',
		'daily-click'
	];
	let mode: 'books' | 'previews' = $state('');
	let chapter = $state();
	onMount(() => {
		return page.subscribe((v) => {
			mode = v.url.searchParams.get('type') ?? '';
		});
	});
	$effect(() => {
		if (dashboardBookStore.selectedBook) {
			dashboardBookStore.selectedPreview = null;
		}
	});
</script>

<div class="p-2"><HeatCount /></div>

<div class="flex justify-start gap-3 my-2 mx-2 h-fit items-center p-2 w-max">
	<div class="font-medium">
		What to see more charts
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
			class="lucide lucide-chart-pie inline"
		>
			<path
				d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"
			/>
			<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
		</svg>
		? Select which statistics to show
	</div>
	<a
		class="text-sm border-1 p-2 h-fit rounded hover:bg-amber {mode ===
		'previews'
			? 'bg-green-100'
			: ''}"
		href="/dashboard/statistics?type=previews"
	>
		Preview URLs Stats
	</a>
	<a
		class="text-sm border-1 p-2 h-fit rounded hover:bg-amber {mode === 'books'
			? 'bg-yellow-100'
			: ''}"
		href="/dashboard/statistics?type=books"
	>
		Book Stats
	</a>
</div>
<div class="mx-auto w-fit m-3 p-6" class:hidden={!mode}><BookSelect /></div>
<!-- markup (zero or more items) goes here -->
{#snippet type()}
	<RadioGroup.Root value="comfortable" class="flex ">
		<div class="flex items-center space-x-2">
			<RadioGroup.Item value="default" id="r1" />
			<Label for="r1">Chapter Like Graph</Label>
		</div>
		<div class="flex items-center space-x-2">
			<RadioGroup.Item value="comfortable" id="r2" />
			<Label for="r2">Comfortable</Label>
		</div>
		<div class="flex items-center space-x-2">
			<RadioGroup.Item value="compact" id="r3" />
			<Label for="r3">Compact</Label>
		</div>
		<Input name="spacing" />
	</RadioGroup.Root>
{/snippet}

{#if dashboardBookStore.selectedBook && mode == 'books'}
	<div
		class="min-h-screen flex flex-col overflow-auto max-w-60vw gap-10 items-center"
	>
		<ChapterLike />
		<hr />
		<ReviewChart />
		<hr />
		<VisitorCount />
		<hr />
		<Referrer />
		<hr />
		<IndustryDist />
		<hr />
		<AgeGroupDist />
	</div>
{/if}

{#if mode == 'previews' && dashboardBookStore.selectedBook}
	<hr class="my-5" />
	<div class="grid place-items-center">
		<PreviewUrlBarGraph />
		{#if dashboardBookStore.selectedPreview == null}
			<div class="w-fit my-2">
				<PreviewDropdown
					text="Select An Preview URL To See Daily Click"
					book_id={dashboardBookStore.selectedBook.id}
					chapter_id={chapter?.id}
					bind:selectedPreview={dashboardBookStore.selectedPreview}
				>
					{#snippet Search()}
						<BoookChapterSelect
							selectedBook={dashboardBookStore.selectedBook}
							bind:selectedChapter={chapter}
							chapterFil={{}}
						/>
					{/snippet}
				</PreviewDropdown>
			</div>
		{:else}
			<PreviewDailyClick />
		{/if}
	</div>
{/if}

<style>
</style>
