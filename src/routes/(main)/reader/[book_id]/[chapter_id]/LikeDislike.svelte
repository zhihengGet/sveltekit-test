<script lang="ts">
	import IconStats from '$components/IconStats.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import Like from '$lib/icons/like.svelte';
	import { useGetPublicSpecificChapter } from '$lib/queries';
	import {
		useCreateUserChapterData,
		useUpdateChapterUserData
	} from '$lib/queries/chapter/mutate/updateUserData';
	import { useGetUserChapterData } from '$lib/queries/chapter/useGetChapterUserData';
	import type { chapter } from '$lib/types';
	let { chapter } = $props<{ chapter: chapter }>();

	const update_chapter_data = useUpdateChapterUserData();
	const crate_chapter_data = useCreateUserChapterData();
	const chapter_data = useGetPublicSpecificChapter(chapter);
	const curr_chapter = $derived(chapter_data.data ?? chapter);
	const user_chapter_data = useGetUserChapterData({
		chapter_id: chapter.id
	});
	const upFn = $derived(
		user_chapter_data.data ? update_chapter_data : crate_chapter_data
	);
	const is_like = $derived(
		user_chapter_data.data?.is_like != undefined
			? user_chapter_data.data.is_like
			: null
	);

	function upsertChapterData({
		is_bookmark,
		bookmark_notes,
		is_like
	}: {
		is_bookmark?: boolean;
		bookmark_notes?: string;
		is_like?: boolean | null;
	}) {
		upFn.mutate({
			book_id: chapter.book_id,
			chapter_id: chapter.id,
			is_bookmark,
			bookmark_notes,
			is_like
		});
	}
</script>

<div class="justify-self-end flex justify-center gap-2 items-center">
	<IconStats count={curr_chapter.like_count}>
		<svelte:fragment>
			<button
				onclick={() => {
					// update like
					upsertChapterData({
						is_like: is_like === true ? null : true,
						bookmark_notes: undefined,
						is_bookmark: undefined
					});
				}}
			>
				<Like
					class="{is_like === false
						? ''
						: is_like === true
							? 'bg-amber'
							: ''} rounded"
				/>
			</button>
		</svelte:fragment>
	</IconStats>
	<IconStats count={curr_chapter.dislike_count}>
		<svelte:fragment>
			<button
				onclick={() => {
					// update like
					upsertChapterData({
						is_like: is_like === false ? null : false,
						bookmark_notes: undefined,
						is_bookmark: undefined
					});
				}}
			>
				<Dislike
					class="{is_like === true ? '' : is_like === false ? 'bg-amber' : ''} "
				/>
			</button>
		</svelte:fragment>
	</IconStats>
</div>
