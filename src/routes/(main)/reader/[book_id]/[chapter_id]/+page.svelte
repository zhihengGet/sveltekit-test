<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { Link } from '$components';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import Sheet from '$components/Sheet.svelte';
	import Button from '$components/button.svelte';
	import {
		COMMENT_IDENTIFIER,
		GET_URL,
		SITE_URL
	} from '$lib/data/constants.js';
	import HTMLViewer from '$lib/editor/HTMLViewer.svelte';
	import ChatIcon from '$lib/icons/chat/ChatIcon.svelte';
	import {
		getChapter,
		queryKey,
		useGetReactivePublicChapters
	} from '$lib/queries';
	import { mount, onDestroy, onMount, tick, untrack } from 'svelte';
	import CreateComment from './NewComment.svelte';
	import Comments from './comments.svelte';
	import Text from '$components/text.svelte';
	import {
		BackToParent,
		CommentStack,
		currentComment,
		parentComment,
		resetCommentStore,
		ReaderTheme,
		chapterMetaStore,
		CommentSheet
	} from './store.svelte';
	import { blur } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { headerControl } from '$lib/state/ui.svelte';
	import Sidebar from './sidebar.svelte';
	import * as Menubar from '$lib/components/ui/menubar';
	import MenuIcon from '$lib/icons/MenuIcon.svelte';
	import { user } from '$lib/state/runes.svelte';
	import LoginButton from '$lib/composite/LoginButton.svelte';
	import { groupChapters } from './helper';
	import Avatar from '$components/avatar.svelte';
	import { isExternalLink } from '$lib/utils/url';
	import ShareButton from '$lib/composite/ShareButton.svelte';
	import { useGetBook } from '$lib/queries/book/getBooks';
	import { IsomorphicSanitizer } from '$lib/utils';
	import { useInfiniteScroll } from '$lib/utils/useInfiniteScroll.svelte';
	import type { chapter, chapterWithUserInfo } from '$lib/types';
	import { OvalSpinner } from '$lib/icons';
	import ChapterContent from './ChapterContent.svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { useUnloadURLParams } from '$lib/queries/preview/usePreview';
	import Like from '$lib/icons/like.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import IconStats from '$components/IconStats.svelte';
	import { useGetUserChapterData } from '$lib/queries/chapter/useGetChapterUserData';
	import {
		useCreateUserChapterData,
		useUpdateChapterUserData
	} from '$lib/queries/chapter/mutate/updateUserData';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Bookmark from 'lucide-svelte/icons/bookmark';
	import CircleOff from 'lucide-svelte/icons/circle-off';
	import Settings2Icon from 'lucide-svelte/icons/settings-2';
	import Popover from '$components/Popover.svelte';
	import { Textarea } from '$components/ui/textarea';
	import Theme from './Theme.svelte';
	import { client as api } from '$lib/queries/api';
	import { commentInfo } from './store.svelte';
	let { data } = $props();
	const update_chapter_data = useUpdateChapterUserData();
	const crate_chapter_data = useCreateUserChapterData();
	const op = $derived({ initialData: null, book_id: data.chapter.book_id });
	const book = useGetBook(() => op);
	//	const curr_chapter = $derived(chapter_data.data ?? data.chapter);
	const user_chapter_data = useGetUserChapterData(() => data.chapter.id);
	const upFn = $derived(update_chapter_data);

	/* const is_like = $derived(
		user_chapter_data.data?.is_like != undefined
			? user_chapter_data.data.is_like
			: null
	); */
	//const is_bookmark = $derived(!!user_chapter_data.data?.is_bookmark);
	let selected_paragraph = $state('');
	let selected_paragraph_id = $state('');

	const chapterList = useGetReactivePublicChapters(() => data.chapter.book_id);

	function summarize(str: string) {
		return str.length > 40
			? str.substring(0, 30) + '...' + str.substring(str.length - 30)
			: str;
	}
	let regex = '</?!?(li|ul)[^>]*>';

	let re = new RegExp(regex, 'g');
	// html text
	function toText(HTML: string | null) {
		if (!HTML) return '';
		if (!browser) {
			return HTML?.replace(re, '');
		}
		const dom = new DOMParser();
		return dom.parseFromString(HTML, 'text/html').textContent ?? '';
	}

	let ids: string[] = [];
	let commentSize: { [s in string]: number } = $state({});

	function iconClick({
		section_id,
		chapter_id,
		textContent
	}: {
		section_id: string;
		chapter_id: number;
		textContent: string;
	}) {
		const id = section_id;
		currentComment.filter = {
			user_id: '',
			section_id: id,
			chapter_id: chapter_id,
			parent_id: null,
			book_id: data.chapter.book_id
		};
		let text = textContent?.trim() ?? '';
		selected_paragraph = summarize(text);
		CommentStack.push({ content: selected_paragraph, parent_id: null });
		open = true;
	}

	let skipMinorVersion = $derived(ReaderTheme.skipVersions);
	const grouped = $derived(groupChapters(chapterList.data, skipMinorVersion));
	const { sortedChapterList, prevMapLast, nextMapLast } = $derived(
		grouped ?? {
			prevMap: {},
			nextMap: {}
		}
	);
	let pageStack = $state([data.chapter]);
	$effect(() => {
		pageStack = [data.chapter];
	});
	// finding current chapter in the sorted array
	let currIndex = $derived(
		sortedChapterList?.findIndex(
			(v) => v.id == pageStack[pageStack.length - 1]?.id
		)
	);
	let prevChapter = $derived(
		skipMinorVersion
			? prevMapLast[pageStack.at(-1)?.id ?? -1]
			: typeof currIndex !== 'undefined' && currIndex > -1
				? sortedChapterList?.[currIndex - 1]
				: null
	);
	let nextChapter = $derived(
		skipMinorVersion
			? nextMapLast[pageStack.at(-1)?.id ?? -1]
			: typeof currIndex !== 'undefined' && currIndex > -1
				? sortedChapterList?.[currIndex + 1]
				: null
	);
	let isLoading = $state(false);
	let isLastPage = $state(false);
	const client = useQueryClient();
	async function markChapterRead() {
		if (nextChapter && user.authStatus === 'signed in') {
			api.rest.api.books.protected.update_user_book_data.$post({
				json: {
					book_id: data.chapter.book_id,
					last_chapter_read: nextChapter.id
				}
			});
		}
	}
	const fetchNextPage = async () => {
		let last = pageStack.at(-1);
		if (!last) return console.error('not chapter in stack');
		//let currIndex = chapterList.data?.findIndex((v) => v.id == last.id);
		let nextNextChapter =
			skipMinorVersion && nextChapter
				? nextMapLast[nextChapter.id]
				: typeof currIndex !== 'undefined' && currIndex > -1
					? sortedChapterList?.[currIndex + 2]
					: null;

		if (
			!isLoading &&
			nextChapter &&
			nextChapter.id &&
			nextChapter.id != last.id // sometime id is string or num
		) {
			console.log('should fetch', data.chapter);
			isLoading = true;
			const next = await /* getChapter({
				id: nextChapter.id
			}); */ client.fetchQuery({
				queryKey: queryKey.getSpecificChapter(nextChapter.id),
				queryFn: () =>
					getChapter({ id: nextChapter.id, book_id: data.chapter.book_id }),
				staleTime: 1000 * 3600 // 1hr
			});
			// on loss focus

			/* 	updatebookda({
				bookID: next?.book_id,
				last_chapter_read: next.id
			}); */

			// also fetch next one to be cached
			if (nextNextChapter) {
				/* const nextNext = await */ client.prefetchQuery({
					queryKey: queryKey.getSpecificChapter(nextNextChapter.id),
					queryFn: () =>
						getChapter({
							id: nextNextChapter.id,
							book_id: data.chapter.book_id
						}),
					staleTime: 1000 * 3600 // 1hr
				});
			}
			if (next) pageStack.push(next);
			if (!next) isLastPage = true;
			isLoading = false;
			tick().then(() => {
				if (next) markChapterRead();
			});
		}
	};
	const infiniteScroll = useInfiniteScroll({
		loading: () => {
			return isLoading;
		},
		onLoadMore: fetchNextPage,
		hasNextPage: () => !!nextChapter,
		delayInMs: 300
	});

	let open = $state(false);
	function updatePageData(newChapter: chapterWithUserInfo) {
		const id = newChapter.id;

		let target = pageStack.find((v) => v.id == id);
		if (target) {
			Object.assign(target, newChapter);
		}
	}
	$inspect('list', chapterList.data);

	afterNavigate(() => {
		headerControl.toggle();
		// auto update last chapter read
		/* if (
			data.chapter.id != userInfo.data?.last_chapter_read &&
			userInfo.data &&
			userInfo.isSuccess
		) {
			updateBookData.mutate({
				is_shelved: userInfo.data?.is_shelved ?? false,
				last_chapter_read: data.chapter.id,
				bookID: data.chapter.book_id
			});
		} */
	});
	function handleClick(e: MouseEvent & { target: Element }) {
		let curr: Element | null = e.target;

		let level = 6; // max 10 level
		while (curr && curr.tagName != 'A' && level >= 0) {
			curr = curr.parentElement;
			level -= 1;
		}
		if (!curr || curr?.localName != 'a') return;
		let href = curr?.getAttribute('href') || e.target.getAttribute('href');
		if (!href) return alert('Not a valid link');
		if (isExternalLink(href ?? '')) {
			e.preventDefault();
			e.stopPropagation();
			const ans = confirm(
				'You are navigation to another website ' +
					href +
					', Are you sure it is safe?'
			);
			if (ans) window.open(href);
			return;
		}
		if (href.startsWith('/') === false && href.startsWith('#') === false)
			return alert('Not a valid link');
	}
	//@description handle open comments based on url
	onMount(() => {
		const url = new URLSearchParams(window.location.search);
		const section_id = url.get('section');
		const parent_id = url.get('parent');
		const comment_id = url.get('comment_id'); // do need this because we fetch user comment
		//console.log(window.location.href, url.getAll('section'), parent_id);
		if (section_id && currentComment.filter) {
			currentComment.filter.parent_id =
				parent_id == '0' ? null : parseInt(parent_id ?? '0');
			currentComment.filter.section_id = section_id;
			currentComment.filter.chapter_id = data.chapter.id;
			currentComment.filter.book_id = data.chapter.book_id;
			CommentStack.push($state.snapshot(currentComment.filter));
			open = true;
		}
		const content = window.document.body
			.getElementsByClassName('main-section')
			.item(0);
		if (content) {
			// warn user if click on an link tag
			content.addEventListener('click', handleClick as EventListener);
			// Remove the previously registered event handler (if any)
			return () => window.removeEventListener('click', handleClick);
		}
	});
	$effect(() => {
		if (open === false) {
			untrack(() => {
				resetCommentStore();
			});
		}
	});
	let openBookmark = $state(false);
	let bookmark_notes = $state('');
	$effect(() => {
		bookmark_notes = user_chapter_data.data?.bookmark_notes ?? '';
	});
	//@description update user-chapter-data
	function upsertChapterData({
		is_bookmark,
		bookmark_notes,
		is_like = user_chapter_data.data?.is_like
	}: {
		is_bookmark?: boolean;
		bookmark_notes?: string;
		is_like?: boolean | null;
	}) {
		//undefined is fine
		upFn.mutate({
			book_id: data.chapter.book_id,
			chapter_id: data.chapter.id,
			is_bookmark,
			bookmark_notes,
			is_like
		});
	}

	onDestroy(() => {
		headerControl.openTopHeader = true;
		headerControl.openBottomHeader = true;
	});
	let openChapterList = $state(false);

	let openTheme = $state(false);

	useUnloadURLParams();

	// generate shadcn compatible colors
	const cssVars = $derived(
		Object.entries(ReaderTheme)
			.map(([key, value]) => `--reader-${key}:${value}`)
			.join(';')
	);
	$effect(() => {
		document.body.style.cssText = cssVars;
	});

	/* const styles = Object.entries({
		'background-color': 'var(--reader-backgroundColor)',
		color: 'var(--reader-color)'
	})
		.map(([key, value]) => `${key}:${value}`)
		.join(';'); */
</script>

<svelte:head>
	<title>{data.chapter.title}</title>
	<meta name={data.chapter.title} content={data.chapter.content} />
	<meta property="og:title" content={data.chapter.title} />
	<meta property="og:type" content="text/html" />
	<meta
		property="og:url"
		content={SITE_URL + `/reader/${data.chapter.book_id}/${data.chapter.id}`}
	/>
	<meta property="og:image" content={data.book_cover} />
</svelte:head>

<Sheet
	desc={selected_paragraph}
	bind:open
	closeOnOutsideClick={true}
	class="reader-theme-invert"
	style={'filter:var(--reader-darken)'}
>
	{#if user.authStatus == 'signed in'}
		<CreateComment />
	{/if}
	{#snippet titleSnippet()}
		<span class="line-height-loose">Comments</span>
	{/snippet}

	{#if user.authStatus !== 'signed in'}
		<span class="underline capitalize">Please sign in to view comment!</span>
		<LoginButton />
	{/if}
	{#if user.authStatus == 'signed in'}
		<div class="flex flex-col justify-start mt-1 overflow-y-auto">
			<Comments />
		</div>
	{/if}

	{#snippet footer()}
		<div in:blur={{ amount: 10 }}>
			<Button
				onclick={() => {
					BackToParent();
				}}
				disabled={!currentComment.filter.parent_id}
				isLoading={parentComment?.isFetching}
			>
				Back({CommentStack.length})
			</Button>
			<Button
				onclick={() => {
					open = false;
					resetCommentStore();
				}}
			>
				Close
			</Button>
		</div>
	{/snippet}
</Sheet>
<Theme bind:open={openTheme} book_id={data.chapter.book_id} />
<!-- Mobile Top Nav-->
<div
	class="fixed top-0 max-w-scren overflow-hidden right-0 h-[50px] z-1 w-full flex md:hidden bg-[#25262f] items-center justify-between px3 transition-all {headerControl.open
		? ''
		: 'translate-y-[-60px]'}"
>
	<a href="/book/{data.chapter.book_id}"><ArrowLeft class="text-white" /></a>

	<span class="text-center truncate grow-1 text-neutral-300">
		{book.data?.title} [{data.chapter.sequence}]
	</span>
	<LoginButton class="text-neutral" />
	<!-- {@render SkipMiniChapter('Skip')} -->
</div>

{#snippet GoButtons()}
	<span class="inline-flex flex-row gap-1 w-fit grow-0">
		{#if prevChapter}
			<a
				class="link-hover text-amber mix-blend-difference"
				id="testlink"
				href="/reader/{data.chapter.book_id}/{prevChapter?.id}"
				data-sveltekit-preload-data="hover"
			>
				<ArrowLeft class="mix-blend-color-burn " />
			</a>
		{:else}
			<CircleOff class="link-hover text-amber mix-blend-difference" />
		{/if}
		{#if nextChapter}
			<a
				class="link-hover text-amber standout"
				href={`/reader/${data.chapter.book_id}/${nextChapter?.id ?? data.chapter.id}`}
				data-sveltekit-preload-data="hover"
			>
				{#if nextChapter}
					<ArrowRight />
				{:else}
					<CircleOff />
				{/if}
			</a>
		{/if}
	</span>
{/snippet}

<!-- Mobile Bot Nav -->
<div
	class="fixed max-w-scren overflow-hidden bottom-0 z-11 left-0 w-full h-[50px] md:hidden bg-[#25262f] flex items-center justify-between px3 {headerControl.open
		? ''
		: 'translate-y-[60px]'}"
>
	<button
		onclick={() => {
			openChapterList = true;
		}}
	>
		<MenuIcon class="standout" />
	</button>
	<span>
		{@render GoButtons()}
	</span>
	<button
		onclick={() => {
			openTheme = true;
		}}
	>
		<Settings2Icon class="standout" />
	</button>
</div>
<!-- Desktop -->
<Menubar.Root
	class="hidden gap-4 border-0 md:flex rounded-0 md:rounded-0 reader-theme"
>
	<Menubar.Menu>
		<!-- 	<Menubar.Trigger asChild> -->
		<a href="/book/{data.chapter.book_id}" class="standout"><ArrowLeft /></a>
		<!-- 	</Menubar.Trigger> -->
		<!-- <Menubar.Content></Menubar.Content> -->
	</Menubar.Menu>
	<Menubar.Menu>
		<!-- 	<Menubar.Trigger asChild> -->
		<button onclick={() => (openTheme = true)} class="standout">
			<Settings2Icon />
		</button>
		<!-- 	</Menubar.Trigger> -->
		<!-- <Menubar.Content></Menubar.Content> -->
	</Menubar.Menu>
	<Menubar.Menu>
		<button
			onclick={() => (openChapterList = true)}
			class="flex w-fit text-red"
		>
			Chapter List &nbsp; &nbsp; <MenuIcon />
		</button>
	</Menubar.Menu>
	<LoginButton />
	<ShareButton
		book_title={book.data?.title}
		title={data.chapter.title}
		description={'Gave it a try !'}
		url={SITE_URL + 'reader/' + data.chapter.book_id + '/' + data.chapter.id}
	/>
	<!-- {@render SkipMiniChapter()} -->
</Menubar.Root>
<Sidebar
	book_id={data.chapter?.book_id}
	bind:open={openChapterList}
	chapterList={grouped}
/>
{#each pageStack as page, index}
	<ChapterContent
		bind:chapter={pageStack[index]}
		bind:open
		openCommentSheet={() => (open = !open)}
		{iconClick}
		{updatePageData}
	/>
{/each}
{#if isLastPage}
	<span class="text-sm font-500">You have reached last page!</span>
{/if}
<div use:infiniteScroll></div>

<style>
	:global(.reader-theme) {
		background-color: var(--reader-backgroundColor) !important;
		color: var(--reader-color) !important;
	}
	/* 	:global(.reader-theme-invert) {
		filter: var(--reader-darken);
	} */
	:global(.chapter p) {
		font-family: inherit;
		margin-bottom: 15px;
		text-indent: 2em;
	}
	/* 	.author-words {
		background-color: aliceblue;
		mix-blend-mode: difference;
	} */
	:global(.standout) {
		color: lightgreen;
		filter: drop-shadow(0.05em 0.05em orange);
		mix-blend-mode: difference;
	}
</style>
