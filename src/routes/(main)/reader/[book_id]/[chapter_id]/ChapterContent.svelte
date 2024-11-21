<script lang="ts">
	import Button from '$components/button.svelte';
	import Text from '$components/text.svelte';
	import { COMMENT_IDENTIFIER } from '$lib/data/constants.js';
	import HTMLViewer from '$lib/editor/HTMLViewer.svelte';
	import ChatIcon from '$lib/icons/chat/ChatIcon.svelte';
	import {
		useGetBookConfig,
		useGetReactivePublicChapters,
		useGetPublicSpecificChapter,
		useGetUserProfile
	} from '$lib/queries';
	import { mount, onDestroy, unmount, untrack, tick } from 'svelte';
	import { ReaderTheme, chapterMetaStore } from './store.svelte';
	import IconStats from '$components/IconStats.svelte';
	import Avatar from '$components/avatar.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import Like from '$lib/icons/like.svelte';
	import { client } from '$lib/queries/api';
	import { useGetBook } from '$lib/queries/book/getBooks';
	import { useUpdateChapterUserData } from '$lib/queries/chapter/mutate/updateUserData';
	import { user } from '$lib/state/runes.svelte';
	import { headerControl } from '$lib/state/ui.svelte';
	import type { chapterWithUserInfo } from '$lib/types';
	import { IsomorphicSanitizer } from '$lib/utils';
	import { useQueryClient } from '@tanstack/svelte-query';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'
import ArrowRight from 'lucide-svelte/icons/arrow-right'
import Bookmark from 'lucide-svelte/icons/bookmark'
import CircleOff from 'lucide-svelte/icons/circle-off';
	import { groupChapters } from './helper';
	import BookmarkButton from './BookmarkButton.svelte';
	import languageCo from '$lib/data/filter/lang';
	import { useOptimisticUpdate } from '$lib/utils/opmisticUpdate.svelte';
	import { afterNavigate } from '$app/navigation';
	import LexicalView from '$lib/editor/LexicalView.svelte';
	import Author from './AuthorWords.svelte';
	import AuthorWords from './AuthorWords.svelte';
	let {
		chapter = $bindable(),
		openCommentSheet,
		iconClick,
		open = $bindable(false),
		updatePageData
	}: {
		chapter: chapterWithUserInfo;
		openCommentSheet: () => boolean;
		iconClick: (args: any) => void;
		updatePageData: (chapter: chapterWithUserInfo) => void;
	} = $props();

	/* afterNavigate(() => {
		tick().then(init);
	}); */
	const update_chapter_data = useUpdateChapterUserData();
	const chapter_data = useGetPublicSpecificChapter(chapter);
	const op = $derived({ initialData: null, book_id: chapter.book_id });
	const book = useGetBook(() => op);
	const curr_chapter = $derived(chapter_data.data ?? chapter);
	const user_chapter_data = $derived(chapter.user_chapter_data[0]);
	const upFn = $derived(update_chapter_data);

	let selected_paragraph_id = $state('');
	const chapterList = useGetReactivePublicChapters(() => chapter.book_id);
	const grouped = $derived(groupChapters(chapterList.data));
	const authorInfo = useGetUserProfile(() => ({ id: chapter.author_id }));

	function summarize(str: string) {
		return str.length > 40
			? str.substring(0, 30) + '...' + str.substring(str.length - 30)
			: str;
	}
	let ids: string[] = [];
	let chatIcons: any[] = [];
	onDestroy(() => {
		for (let x of chatIcons) {
			unmount(x);
		}
	});
	let commentSize: { [s in string]: string } = $state({});
	let selected_paragraph: HTMLElement = $state();
	function handleOpenComment(
		id: string,
		textContent: string,
		paragraph: HTMLElement
	) {
		if (id) {
			selected_paragraph_id = id;
		} else {
			return alert('error with getting paragraph id');
		}
		selected_paragraph = paragraph;
		onHighlight();
		iconClick({
			user_id: '',
			section_id: id,
			chapter_id: chapter.id,
			parent_id: null,
			book_id: chapter.book_id,
			textContent: textContent
		});
	}
	function onHighlight() {
		selected_paragraph?.classList?.toggle('highlight-selected');
	}
	$effect(() => {
		if (open == false) {
			onHighlight();
		}
	});
	let rendered: any = {};
	function init(node: HTMLElement = document.body) {
		console.log('initialized getting chapter ids');
		let css = 'p[' + COMMENT_IDENTIFIER + ']';
		document.body.querySelectorAll;
		let p = node.querySelectorAll(css);
		console.log('found p', p.length);
		for (let x of p) {
			let id = x.getAttribute(COMMENT_IDENTIFIER);
			const size = x.textContent?.length ?? 0;
			console.log('testing text content', size, id, p.length);
			if (!id || id in rendered || size <= 5) {
				continue;
			}
			//rendered[id] = true;
			const button = document.createElement('button');
			button.onclick = () => handleOpenComment(id, x.textContent ?? '', x);
			x.appendChild(button);
			const chat = mount(ChatIcon, {
				target: button,
				props: { commentSize, id }
			});
			chapterMetaStore.section_ids.add(id);
		}
		handleFetchCommentLength();
	}
	async function getParagraphComments() {
		const res = await client.rest.api.comments.protected.count.$post({
			json: {
				chapter_id: chapter.id + '',
				section_ids: ids,
				type: 'comment_count'
			}
		});
		if (res.status !== 200) return [];
		return res.json();
	}
	const clientTan = useQueryClient();
	async function handleFetchCommentLength() {
		if (ids.length > 200) return console.log('too many paragraphs...');
		if (ids.length < 1 || user.authStatus !== 'signed in') return;
		const url = new URLSearchParams();
		url.set('chapter_id', chapter.id + '');
		url.set('section_ids', JSON.stringify(ids.filter((v) => v)));
		url.set('type', 'comment_count');
		console.log(url.toString());

		const size =
			/*  await getParagraphComments();  */ await clientTan.fetchQuery({
				queryKey: ['get comment for paragraph', url.toString()],
				queryFn: () => getParagraphComments()
			});
		for (let x in size) {
			commentSize[x.section_id] = x.count;
		}

		console.log('COMMENT_', commentSize);
	}

	const { prevMap, nextMap } = $derived(
		grouped ?? {
			prevMap: {},
			nextMap: {}
		}
	);
	let skipMinorVersion = $state(false);
	const pageStack = $state([chapter]);

	let currIndex = $derived(
		chapterList.data?.findIndex(
			(v) => v.id == pageStack[pageStack.length - 1]?.id
		)
	);
	let prevChapter = $derived(
		skipMinorVersion
			? prevMap[pageStack.at(-1)?.id ?? -1]
			: typeof currIndex !== 'undefined' && currIndex > -1
				? chapterList.data?.[currIndex - 1]
				: null
	);
	let nextChapter = $derived(
		skipMinorVersion
			? nextMap[pageStack.at(-1)?.id ?? -1]
			: typeof currIndex !== 'undefined' && currIndex > -1
				? chapterList.data?.[currIndex + 1]
				: null
	);
	//onMount(init);
	let openBookmark = $state(false);
	let bookmark_notes = $state('');
	const is_like_truth = $derived(
		user_chapter_data?.is_like != undefined ? user_chapter_data.is_like : null
	);
	$effect(() => {
		bookmark_notes = user_chapter_data?.bookmark_notes ?? '';
	});
	const [value, setValue] = useOptimisticUpdate(() => {
		return { dataParent: is_like_truth, mutations: [upFn] };
	});
	let is_like = $derived.by(value);
	//@description update user-chapter-data
	function upsertChapterData({
		is_bookmark,
		bookmark_notes,
		is_like = user_chapter_data?.is_like,
		onSuccess
	}: {
		is_bookmark?: boolean;
		bookmark_notes?: string;
		is_like?: boolean | null;
		onSuccess?: () => void;
	}) {
		//undefined is fine
		upFn.mutate(
			{
				book_id: chapter.book_id,
				chapter_id: chapter.id,
				is_bookmark,
				bookmark_notes,
				is_like,
				prev_is_like: value()
			},
			{
				onSuccess: () => {
					onSuccess?.();
				}
			}
		);
		chapter.user_chapter_data[0] = chapter.user_chapter_data[0] ?? {};
		setValue(is_like);
	}
	const config = useGetBookConfig(() => {
		return { book_id: book.data?.id };
	});
	let lang = $derived(
		languageCo.find((v) => v.name == book.data?.language)?.code
	);
	//IsomorphicSanitizer can remove what we added
	/* $effect(() => {
		if (chapter.content) init();
	}); */
</script>

<section
	class="box-content relative w-full h-full min-h-screen overflow-x-hidden max-w-screen main-section break-words hyphens-auto"
	style="background-color:{ReaderTheme.containerBackgroundColor};user-select:{config
		.data?.allow_copy
		? ''
		: 'none'}"
	{lang}
>
	<h1
		class="flex justify-center w-full text-2xl font-extrabold mt-10px text-black"
		style="color:{ReaderTheme.color}"
	>
		{chapter.title}
	</h1>
	<h2 class="text-center text-gray">
		Chapter {Math.floor(chapter.sequence)} (S{chapter.sequence.toFixed(2)})
	</h2>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="-1"
		onclick={() => {
			headerControl.open = !headerControl.open;
		}}
		class="w-full mx-auto md:w-8/10 lg:w-6/10 xl:w-5/10 chapter"
		data-id={chapter.id}
		style="--chapter-comment-opacity:{ReaderTheme.commentsOp}; color:{ReaderTheme.color};line-height:{ReaderTheme.lineHeight};font-size:{ReaderTheme.fontSize} !important;"
	>
		<BookmarkButton bind:chapter />
		<LexicalView initialHTML={chapter.content} {init} />
	</div>

	<div>
		<AuthorWords
			username={authorInfo.data?.username ?? ''}
			authorImageUrl={authorInfo.data?.avatar_url ?? ''}
			words={chapter.authors_words || 'Undefined Signal'}
		/>
	</div>
	<footer class="flex items-center justify-center gap-5 my-2 standout">
		<div class="flex items-center justify-center gap-1 justify-self-end">
			<IconStats count={curr_chapter.like_count}>
				<button
					class="w-[20px] h-[20px]"
					disabled={user.authStatus !== 'signed in'}
					onclick={() => {
						// update like
						upsertChapterData({
							is_like: is_like === true ? null : true
						});
					}}
				>
					<Like
						class="{is_like === false
							? ''
							: is_like === true
								? 'animate-spin'
								: ''} rounded"
					/>
				</button>
			</IconStats>
			<IconStats count={curr_chapter.dislike_count}>
				<button
					class="w-[20px] h-[20px]"
					disabled={user.authStatus !== 'signed in'}
					onclick={() => {
						// update like
						upsertChapterData({
							is_like: is_like === false ? null : false
						});
					}}
				>
					<Dislike
						class="{is_like === true
							? ''
							: is_like === false
								? 'animate-spin'
								: ''} "
					/>
				</button>
			</IconStats>
		</div>
	</footer>
</section>

<style>
	:global(.highlight-selected) {
		border: 1px solid;
	}
	:global(.reader-theme-invert pre) {
		filter: var(--reader-darken);
	}

	:global(.editor-container-shell .editor p, .editor span) {
		font-size: var(--reader-fontSize) !important;
		line-height: var(--reader-lineHeight);
		font-family: var(--reader-fontFamily);
	}
</style>
