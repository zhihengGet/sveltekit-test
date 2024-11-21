<script lang="ts">
	import Button from '$components/button.svelte';
	import { useUpdateChapter } from '$lib/queries';
	import { debounce } from 'lodash-es';
	import { InkStore } from '../../store.svelte';
	import BulkUpload from './BulkUpload.svelte';
	import ChapterSheet from './ChapterSheet.svelte';
	import NewChapter from './NewChapter.svelte';

	let update = useUpdateChapter();

	const deb = debounce(update.mutate, 500);
</script>

<NewChapter />
<ChapterSheet />
<BulkUpload />

<main class="container flex items-center justify-center flex-col">
	{#if InkStore.chapter}
		<!-- <h1 class="text-xl my-5 capitalize">{InkStore.chapter?.title}</h1>

		<div class="">
			<button
				onclick={() => {
					InkStore.preview.open = true;
				}}
			>
				create previews
			</button>
			<ChapterForm showDescription={false} />
			<span>
				Last Updated At: {timeAgo(new Date(InkStore.chapter.updated_at))}
			</span>
			<div class="border-x border-t">
				<Editor
					isMaxLength={false}
					isAutocomplete={InkStore.enableAutocomplete}
					onInput={(e:string) => {
						console.log('received new content', e);
						if (
							(InkStore.chapter && e.trim().length > 0) ||
							InkStore.chapter?.content != e.trim()
						) {
							deb({
								content: e,
								id: InkStore.chapter?.id,
								action: 'draft'
							});
						}
					}}
				/>
			</div>
		</div> -->
	{:else}
		<div class="w-full h-50vh flex items-center justify-center">
			<Button class="" onclick={() => (InkStore.openCreateDialog = true)}>
				Create New Chapter
			</Button>
		</div>
	{/if}
</main>
