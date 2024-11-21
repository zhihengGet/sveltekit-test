<script lang="ts">
	import Button from '$components/button.svelte';
	import Popover from '$components/Popover.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import { MAX_BOOKMARK_LENGTH } from '$lib/data/constants';
	import {
		useCreateUserChapterData,
		useUpdateChapterUserData
	} from '$lib/queries/chapter/mutate/updateUserData';
	import { useGetUserChapterData } from '$lib/queries/chapter/useGetChapterUserData';
	import { user } from '$lib/state/runes.svelte';
	import type { chapter, chapterWithUserInfo } from '$lib/types';
	import { useOptimisticUpdate } from '$lib/utils/opmisticUpdate.svelte';
	import Bookmark from 'lucide-svelte/icons/bookmark';

	let { chapter = $bindable() }: { chapter: chapterWithUserInfo } = $props();

	const update_chapter_data = useUpdateChapterUserData();
	//const crate_chapter_data = useCreateUserChapterData();
	const user_chapter_data = useGetUserChapterData(() => chapter.id);
	const upFn = update_chapter_data;
	const is_bookmark_truth = $derived(!!user_chapter_data.data?.is_bookmark);
	let openBookmark = $state(false);
	const [value, setValue] = useOptimisticUpdate(() => {
		return {
			dataParent: {
				is_bookmark: is_bookmark_truth,
				bookmark_notes: user_chapter_data.data?.bookmark_notes
			},
			mutations: [upFn]
		};
	});
	const is_bookmark = $derived(value().is_bookmark);
	//@description update user-chapter-data
	function upsertChapterData({
		is_bookmark,
		bookmark_notes,
		//	is_like = user_chapter_data.data?.is_like,
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
				bookmark_notes
				//	is_like
			},
			{ onSuccess: () => onSuccess?.() }
		);
		//chapter.user_chapter_data[0] = chapter.user_chapter_data[0] ?? {};
		//setValue({ is_bookmark, bookmark_notes });
	}
</script>

{#if user.authStatus === 'signed in'}
	<Popover bind:open={openBookmark} class="" closeOnOutside={false}>
		<span class="block h-150px">
			<Textarea
				oninput={(e) => {
					value().bookmark_notes = e.target.value;
				}}
				value={value().bookmark_notes}
				maxlength={20}
				placeholder={'Write some thoughts ⏏ (max ' +
					MAX_BOOKMARK_LENGTH +
					' characters)'}
			/>
			<br />
			{#if is_bookmark}
				<Button
					variant="ghost"
					class="float-left {is_bookmark ? '' : 'hidden'}"
					onclick={() => {
						upsertChapterData({ is_bookmark: false });
						setValue({ ...value(), is_bookmark: false });
						//debugger;
					}}
				>
					Unmark ☒
				</Button>
			{/if}

			<Button
				variant="ghost"
				class="float-left"
				onclick={() => {
					openBookmark = false;
				}}
			>
				Close 🌂
			</Button>
			<Button
				class="float-right"
				isLoading={upFn.isPending}
				onclick={() => {
					upFn.mutate(
						{
							book_id: chapter.book_id,
							chapter_id: chapter.id,
							is_bookmark: true,
							bookmark_notes: value().bookmark_notes
						},
						{
							onSuccess: () => {
								openBookmark = false;
							}
						}
					);
					//we dont want to optimisticaly update this since bookmark note is kinda important ?
				}}
			>
				+ save
			</Button>
		</span>
	</Popover>
	<button
		name="bookmark chapter"
		disabled={user.authStatus !== 'signed in'}
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			openBookmark = !openBookmark;
		}}
	>
		<Bookmark class={is_bookmark ? 'bg-red rounded' : ''} />
	</button>
{/if}
