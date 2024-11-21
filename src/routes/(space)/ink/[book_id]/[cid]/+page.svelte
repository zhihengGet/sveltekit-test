<script lang="ts">
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import Button from '$components/button.svelte';
	import Editor from '$lib/editor/simpleEditor.svelte';
	import { useGetPrivateSpecificChapter, useUpdateChapter } from '$lib/queries';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { readable } from 'svelte/store';
	import { InkStore, WordBank } from '../../../store.svelte';
	import BulkUpload from '../BulkUpload.svelte';
	import ChapterForm from '../ChapterForm.svelte';
	import ChapterSheet from '../ChapterSheet.svelte';
	import NewChapter from '../NewChapter.svelte';
	import Vocab from '../WordBank.svelte';
	import { ceil, debounce } from 'lodash-es';
	import { onDestroy, onMount } from 'svelte';
	import uFuzzy from '@leeoniya/ufuzzy';
	import { statusToActions } from '$lib/data/dbConstants';
	import { getSize, getStringInfo } from '$lib/utils/fileUtils';
	import { formatNumber } from '$lib/utils';
	import {
		COMMENT_IDENTIFIER,
		MAX_CHAPTER_BYTE,
		MAX_CHAPTER_STRIPED_HTML_LENGTH
	} from '$lib/data/constants';
	import { toastNotify } from '$lib/utils/toast';
	import PreviewIcon from '$lib/icons/PreviewIcon.svelte';
	//import PreviewGenerator from '$lib/composite/PreviewGenerator.svelte';
	let update = useUpdateChapter(false);
	let prevChapterContent = ''; //not need to be reactive
	let content = $state('');
	async function updator(toast: boolean = false) {
		console.log(InkStore);
		/* const body = document.getElementsByClassName('editor-container').item(0);
		if (body) {
			// mark all p dirty
			const p = body.getElementsByTagName('p').item(0);
			const ID = p?.getAttribute(COMMENT_IDENTIFIER);
			if (!ID) {
				p?.setAttribute(COMMENT_IDENTIFIER, 'mark-dirty');
			}
		} */
		await sleep(500); // wait for editor to update
		update.mutate(
			{
				content: content.trim(),
				id: InkStore.chapter?.id,
				book_id: InkStore.chapter?.book_id,
				sequence: InkStore.chapter?.sequence,
				//@ts-expect-error
				action: statusToActions[InkStore.chapter?.status] ?? 'draft' // keep current status,allow edit trashed chapter which will delay removal
			},
			{
				onSuccess: () => {
					//mark dirty HTML

					last_updated = timeAgo(new Date());
					prevChapterContent = content;
					if (toast) toastNotify.success('saved');
				}
			}
		);
	}
	const time = readable(0, (set) => {
		const updateLimit = 30;
		const interval = setInterval(() => {
			set(($time + 1) % updateLimit);
			if (
				content.trim() == prevChapterContent?.trim() ||
				$time % updateLimit != 0
			) {
				return console.info('skip update chapter', content.length);
			} else {
				if (chapter.isFetching == false && !update.isPending) {
					//update chap content
					console.log('about to update', InkStore.chapter);
					updator(false);
				}
			}
		}, 1000);

		beforeNavigate(() => {
			set(-1);
		});
		return () => clearInterval(interval);
	});

	let queryPayload = $state({ id: $page.params.cid || '0' });

	const unsub = page.subscribe((v) => {
		//console.log('$page store changed', v.params);
		queryPayload.id = $page.params.cid || '0';
	});

	onDestroy(() => {
		unsub();
	});
	$inspect(queryPayload);
	const chapter = useGetPrivateSpecificChapter(() => queryPayload);

	let last_updated = $state();

	$effect(() => {
		if (chapter.isSuccess) {
			InkStore.chapter = chapter.data;
		}
		const handler = function (e) {
			if (
				e.keyCode == 83 &&
				(navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)
			) {
				e.preventDefault();
				updator(true);
				//your implementation or function calls
			}
		};
		document.addEventListener('keydown', handler, false);
		return () => document.removeEventListener('keydown', handler);
	});

	onNavigate(() => {
		if (!window.location.href.endsWith(InkStore.chapter?.id))
			InkStore.chapter = null; // clear InkStore

		return () => (InkStore.openChapterSheet = false);
	});
	function updateContent(e) {
		content = e;
	}
	const debUp = debounce(updateContent, 500);
	const uf = new uFuzzy({
		unicode: true,
		interIns: 0,
		interLft: 2,
		intraIns: 0
	});
	const pager = $derived($page);
	$effect(() => {
		if (pager.url.href) {
			chapter.refetch();
		}
	});
	/* $effect(() => {
		// run twice due to bug
		return page.subscribe((v) => {
			chapter.refetch();
		});
	}); */
	const info = $derived(
		getStringInfo({
			html: content,
			maxByte: MAX_CHAPTER_BYTE,
			maxLength: MAX_CHAPTER_STRIPED_HTML_LENGTH,
			useTextContext: true
		})
	);
	let openedItem = $state('');
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Pickaxe from 'lucide-svelte/icons/pickaxe'
import Upload from 'lucide-svelte/icons/upload';
	import { sleep } from '$lib/utils/sleep';
	import { Spinner } from '$lib/icons';
	import BarLoader from '$lib/icons/loader/BarLoader.svelte';
</script>

<!-- <Vocab /> -->
<NewChapter />
<ChapterSheet />
<BulkUpload />

<main class="container flex items-center justify-center flex-col">
	{#if chapter.isFetching}
		Loading Content <Spinner />
	{:else}
		<QueryLoaderRunes CreateQueryResult={chapter}>
			{#if chapter.data}
				<h1 class="text-xl my-5 capitalize">{InkStore.chapter?.title}</h1>
				<h2 class="text-md text-gray my-5 capitalize">
					{InkStore.book?.title}
				</h2>

				<div class="w-full">
					<span class:hidden={InkStore.focus}>
						<div class="flex items-center">
							<button
								class="capitalize text-sm rounded mr-1"
								class:hidden={InkStore.chapter?.status !== 'draft'}
								onclick={() => {
									InkStore.preview.open = true;
								}}
							>
								<PreviewIcon class="w-1rem h-1rem inline" /> Create Preview
							</button>
							<!-- 	{openedItem} -->
							<Accordion.Root
								bind:value={openedItem}
								class=" {openedItem
									? 'w-full mx-auto  mb-2'
									: 'w-44 inline-block bg-transparent '}  text-sm sm:max-w-[70%] bg-neutral-100 "
							>
								<Accordion.Item value="item-1">
									<Accordion.Trigger
										class="p-1 text-sm text-gray-500 hover:text-black flex"
									>
										<svg
											width="16px"
											height="16px"
											viewBox="0 0 48 48"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
											<g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											></g>
											<g id="SVGRepo_iconCarrier">
												<rect
													width="48"
													height="48"
													fill="white"
													fill-opacity="0.01"
												></rect>
												<path
													d="M48 0H0V48H48V0Z"
													fill="white"
													fill-opacity="0.01"
												></path>
												<path
													d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
													fill="#2F88FF"
													stroke="#000000"
													stroke-width="4"
													stroke-linecap="round"
													stroke-linejoin="round"
												></path>
												<path
													d="M33.5424 27C32.2681 31.0571 28.4778 34 24.0002 34C19.5226 34 15.7323 31.0571 14.458 27V33"
													stroke="white"
													stroke-width="4"
													stroke-linecap="round"
													stroke-linejoin="round"
												></path>
												<path
													d="M33.5424 15V21C32.2681 16.9429 28.4778 14 24.0002 14C19.5226 14 15.7323 16.9429 14.458 21"
													stroke="white"
													stroke-width="4"
													stroke-linecap="round"
													stroke-linejoin="round"
												></path>
											</g>
										</svg>
										Update Chapter Info
									</Accordion.Trigger>
									<Accordion.Content>
										<ChapterForm showDescription={false} />
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						</div>

						<span class="text-sm text-gray-400 block">
							Last Updated At: {last_updated ||
								timeAgo(new Date(chapter.data.user_modified_at))}
							<svg
								viewBox="0 0 1024 1024"
								class="inline align-middle"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								fill="#000000"
								width={15}
							>
								<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
								<g
									id="SVGRepo_tracerCarrier"
									stroke-linecap="round"
									stroke-linejoin="round"
								></g>
								<g id="SVGRepo_iconCarrier">
									<path
										d="M736.68 435.86a173.773 173.773 0 0 1 172.042 172.038c0.578 44.907-18.093 87.822-48.461 119.698-32.761 34.387-76.991 51.744-123.581 52.343-68.202 0.876-68.284 106.718 0 105.841 152.654-1.964 275.918-125.229 277.883-277.883 1.964-152.664-128.188-275.956-277.883-277.879-68.284-0.878-68.202 104.965 0 105.842zM285.262 779.307A173.773 173.773 0 0 1 113.22 607.266c-0.577-44.909 18.09-87.823 48.461-119.705 32.759-34.386 76.988-51.737 123.58-52.337 68.2-0.877 68.284-106.721 0-105.842C132.605 331.344 9.341 454.607 7.379 607.266 5.417 759.929 135.565 883.225 285.262 885.148c68.284 0.876 68.2-104.965 0-105.841z"
										fill="#4A5699"
									></path>
									<path
										d="M339.68 384.204a173.762 173.762 0 0 1 172.037-172.038c44.908-0.577 87.822 18.092 119.698 48.462 34.388 32.759 51.743 76.985 52.343 123.576 0.877 68.199 106.72 68.284 105.843 0-1.964-152.653-125.231-275.917-277.884-277.879-152.664-1.962-275.954 128.182-277.878 277.879-0.88 68.284 104.964 68.199 105.841 0z"
										fill="#C45FA0"
									></path>
									<path
										d="M545.039 473.078c16.542 16.542 16.542 43.356 0 59.896l-122.89 122.895c-16.542 16.538-43.357 16.538-59.896 0-16.542-16.546-16.542-43.362 0-59.899l122.892-122.892c16.537-16.542 43.355-16.542 59.894 0z"
										fill="#F39A2B"
									></path>
									<path
										d="M485.17 473.078c16.537-16.539 43.354-16.539 59.892 0l122.896 122.896c16.538 16.533 16.538 43.354 0 59.896-16.541 16.538-43.361 16.538-59.898 0L485.17 532.979c-16.547-16.543-16.547-43.359 0-59.901z"
										fill="#F39A2B"
									></path>
									<path
										d="M514.045 634.097c23.972 0 43.402 19.433 43.402 43.399v178.086c0 23.968-19.432 43.398-43.402 43.398-23.964 0-43.396-19.432-43.396-43.398V677.496c0.001-23.968 19.433-43.399 43.396-43.399z"
										fill="#E5594F"
									></path>
								</g>
							</svg>
							Next Update-{30 - $time}
							<!-- 	{InkStore.focus} -->
						</span>
					</span>

					<div class="border-x border-t">
						<Editor
							onInput={async (e) => {
								console.log('received new content', e);
								if (InkStore.chapter && e?.trim().length > 0) {
									debUp(e);
								}
							}}
							config={{
								//@ts-ignore
								query: (s) => {
									const filter = uf.search(WordBank, s)[0];
									if (!filter) return { promise: [], dismiss: () => {} };
									if (filter.length == 0) return { promise: [] };
									return {
										promise: filter
											.map((v) => WordBank[v])
											.filter((v) => v !== s)
											.slice(0, 4)
											.filter((v) => v?.startsWith(s))
									};
								}
							}}
							dis
							isMaxLength={false}
							isCharLimitUtf8={false}
							isCharLimit={false}
							isDraggable={false}
							showToolbar={InkStore.focus === false}
							isAutocomplete={InkStore.enableAutocomplete}
							initialHTML={chapter.data?.content ?? 'Loading'}
						/>
						<!-- <span class="text-red font-500 text-sm">
						{info.lengthErrorMessage}
					</span>
					<span class="text-red font-500 text-sm">
						{info.sizeErrorMessage}
					</span> -->
						<span class="text-gray font-500 text-sm">
							{info.message}
						</span>
					</div>
				</div>
			{:else}
				<div class="w-full h-50vh flex items-center justify-center">
					<Button class="" onclick={() => (InkStore.openCreateDialog = true)}>
						Create New Chapter
					</Button>
				</div>
			{/if}
		</QueryLoaderRunes>
	{/if}
</main>

<style>
	:global(body) {
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
