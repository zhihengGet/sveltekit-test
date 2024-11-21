<script lang="ts">
	import Sheet from '$components/Sheet.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { useGetBook, useGetReactivePublicChapters } from '$lib/queries';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { formatDistanceToNow } from 'date-fns';
	import { tick } from 'svelte';
	import { groupChapters } from './helper';
	import { chapterMetaStore, ReaderTheme } from './store.svelte';

	import { page } from '$app/stores';
	import { generatePreviewURL } from '$lib/queries/preview/usePreview';

	let {
		open = $bindable(false),
		//	chapterList,
		book_id
	}: {
		book_id: number;
		open: boolean;
		chapterList?: ReturnType<typeof groupChapters>;
	} = $props();

	const op = $derived({ initialData: null, book_id: book_id });
	const book = useGetBook(() => op);
	const chapterList = useGetReactivePublicChapters(() => book_id);
	const list = $derived({
		data: groupChapters(chapterList.data)
	});

	const [keys, groups] = $derived([
		list.data?.mainSequences,
		list.data?.chaptersGroupByMainSeq
	]);
	const seq = $derived(keys);

	function scrollIntoView(node: Element) {
		console.log(
			chapterMetaStore.current_chapter?.id,
			node.getAttribute('data-chapter-id')
		);

		if (
			node.getAttribute('data-chapter-id') ==
			chapterMetaStore.current_chapter?.id + ''
		) {
			//console.log('FOUND IT ', node);
			tick().then(() => {
				node.scrollIntoView({
					behavior: 'instant',
					block: 'start'
				});
			});
		}
	}
	let pid = $derived($page.url.searchParams.get('preview_session_id'));
	// handle version
</script>

<Sheet
	bind:open
	desc={book.data?.authors_words ?? ''}
	style={'color:' +
		ReaderTheme.color +
		';background-color:' +
		ReaderTheme.backgroundColor}
>
	{#snippet titleSnippet()}
		<span class="text-red">{book.data.title}</span>
	{/snippet}
	<p class="my-1 text-gray text-sm">
		Created {formatDistanceToNow(book.data?.created_at ?? '1900', {
			addSuffix: true
		})}
	</p>
	<p class="my-1 text-gray">
		Updated {formatDistanceToNow(book.data?.user_modified_at ?? '1900', {
			addSuffix: true
		})}
	</p>
	<button
		class="hover:text-yellow block w-full text-xs text-gray-800 text-right"
		onclick={chapterList.refetch}
	>
		Refresh⭗<!--  {list.data.length} -->
	</button>
	<div class=" text-1.3rem">
		{#each seq ?? [] as s, index (s)}
			{@const chapter = groups[s]?.[0]}
			<div class="my-5 h-fit">
				{#if groups[s]?.length === 1}
					<div>
						<div class="flex items-center relative">
							<span class="pr-1">{index}.</span>
							<a
								href={generatePreviewURL({
									book_id: chapter?.book_id,
									chapter_id: chapter.id
								})}
								data-chapter-id={chapter?.id}
								class="hover:blue w-80% truncate"
								use:scrollIntoView
							>
								{chapter!.title}
								<span class="text-sm text-gray uppercase shrink-0 w-fit">
									{chapter?.status !== 'published' ? chapter?.status : ''}
								</span>
							</a>
						</div>
						<hr />
						<div class="flex justify-center text-sm text-gray">
							{formatDistanceToNow(chapter!.user_modified_at)}
						</div>
					</div>
				{/if}
				{#if (groups?.[s]?.length ?? 0) > 1}
					{@const parent_chapter = groups?.[s]?.[0]}
					<Accordion.Root>
						<Accordion.Item value="item-1 relative">
							<Accordion.Trigger class="flex grow-0 items-center">
								<a
									href={generatePreviewURL({
										book_id: groups?.[s]?.[0]?.book_id,
										chapter_id: parent_chapter?.id
									})}
									slot="text"
									class="self-center truncate grow-1 flex flex-nowrap"
								>
									<span class="truncate">
										{index}. {groups[s]?.[0]?.title}
									</span>
									<span class="text-sm text-gray uppercase shrink-0 w-fit">
										{chapter?.status !== 'published' ? chapter?.status : ''}
									</span>
								</a>
							</Accordion.Trigger>
							<Accordion.Content>
								{#each groups[s] ?? [] as oldChapter, i}
									<a
										class="flex flex-nowrap"
										href={`/reader/${book_id}/${oldChapter.id}?${pid ? `preview_session_id=${pid}` : ''}`}
									>
										<span class="truncate inline-block w-2/3">
											{i}.{oldChapter.title}
											<span class="text-[0.8em] text-gray">
												(s{oldChapter.sequence})
											</span>
										</span>
										<span
											class="text-0.8em text-gray uppercase shrink-0 w-fit px-1"
										>
											{oldChapter?.status !== 'published'
												? oldChapter?.status
												: ''}
										</span>
										<span class="inline-block w-2/5 text-sm text-gray">
											{timeAgo(oldChapter?.user_modified_at)}
										</span>
									</a>
								{/each}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				{/if}
			</div>
		{/each}
	</div>
</Sheet>
