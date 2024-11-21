<script lang="ts">
	import PaginateUi from '$components/PaginateUI.svelte';
	import Like from '$lib/icons/like.svelte';
	import {
		useUpdateAuthCredential,
		useUpdateUserBookData,
		useUpdateUserInfo
	} from '$lib/queries';
	import { useGetHasUnreadReplies } from '$lib/queries/comment/getChapterComment.svelte';
	import { useGetShelfFolders } from '$lib/queries/folders/folders';
	import { user } from '$lib/state/runes.svelte';
	import Camera from 'lucide-svelte/icons/camera'
import Send from 'lucide-svelte/icons/send'
import Settings2 from 'lucide-svelte/icons/settings-2';
	import ViewerReview from '../../book/[book_id]/ViewerReview.svelte';
	import ViewerComment from './ViewerComment.svelte';
	import { profileStore } from './store.svelte';
	//import { differenceInCalendarYears } from 'date-fns';
	import FolderManager from '$components/shared/FolderManager.svelte';
	import { DEFAULT_FOLDER } from '$lib/data/constants';
	import QuillView from '$lib/editor/QuillView.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import type { book, profile, user_book_data } from '$lib/types';
	import CameraSnap from './CameraSnap.svelte';
	import ProfileSettingDialog from './ProfileSettingDialog.svelte';
	import SubscribeButton from './SubscribeButton.svelte';
	import ViewerBookMark from './ViewBookmarkedChapters.svelte';
	import { formatNumber } from '$lib/utils';
	import type { SvelteComponent } from 'svelte';
	type props = { profile: profile; publicProfile: profile; email?: string };
	let { data }: { data: props } = $props();
	let camera: CameraSnap = $state();
	const publicProfile = $derived(
		user?.id === data.publicProfile?.id ? user : data.publicProfile
	); // other users' profile
	let modified = $state(
		data.profile
			? {
					...data.profile,
					email: data.email,
					birthday: data.profile.birthday
						? new Date(data.profile.birthday).toISOString().split('T')[0]
						: ''
				}
			: {
					username: '',
					language: 'English',
					email: data.email,
					birthday: '',
					occupation: ''
				}
	);

	const isSelf = $derived(user?.id === data.publicProfile?.id);
	let open = $state(false);
	//const folders = $derived(buckets?.data?.folders.concat(['default']));
	function handleSetting() {
		if (isSelf == false) return;
		open = !open;
		//	target = 'title';
	}

	$inspect(modified);
	const unreadComments = useGetHasUnreadReplies();
	let openReview = $state(false);
	let openComment = $state(false);
	let openBookmark = $state(false);
</script>

{#if data.profile && data.email}
	<ProfileSettingDialog profile={data.profile} email={data.email} bind:open />
{/if}
<ViewerReview
	bind:open={openReview}
	showUserReview={true}
	user_id={publicProfile.id}
/>
{#if openComment}
	<ViewerComment bind:open={openComment} userid={publicProfile.id} />
{/if}

<ViewerBookMark bind:open={openBookmark} />

{#snippet StackNumber({
	text,
	num,
	Icon,
	style
}: {
	text: string;
	num: number;
	Icon?: Component;
	style?: string;
})}
	<div
		class="inline-flex w-[80px] p-1 flex-col items-center justify-start {style}"
	>
		<div class="text-sm font-light">
			{text}
			<!-- 		<Icon /> -->
		</div>
		<div class="text-sm font-bold">
			{num}
		</div>
	</div>
{/snippet}
<div
	class="w-full md:w-[500px] mt-5 h-fit glass flex flex-col gap-2 justify-center items-center"
>
	<div
		class="flex h-16 items-center justify-between border-b-2 border-gray-300 px-4"
	>
		<button
			onclick={() => camera.startup()}
			class="focus:outline-none opacity-30 mx-2"
			disabled={!camera}
		>
			<Camera />
		</button>
		<SubscribeButton profile={data.publicProfile} />
		<!-- <Send size={20} color="gray" class="mx-1" /> -->
	</div>
	{#if isSelf}
		<CameraSnap bind:this={camera} />
	{/if}

	<img
		class="w-9/10 h-60 max-h-9/10 bg-neutral-2 mx-5 border-gray-100 border-2 outline-gray rounded object-contain"
		src={publicProfile?.avatar_url}
		alt="Invalid Avatar URL"
	/>
	<p class="text-sm text-cyan-900">{publicProfile?.username}</p>
	<div
		class="mt-5 w-9/10 flex justify-start flex-col gap-1 line-clamp-5 max-h-400px overflow-auto"
	>
		<span class="flex justify-evenly">
			{@render StackNumber({
				text: 'Follower',
				num: publicProfile.follower_count
			})}
			{@render StackNumber({
				text: 'Likes',
				num: publicProfile.like_count,
				Icon: Like
			})}
			{@render StackNumber({
				text: 'Dislikes',
				num: publicProfile.dislike_count
			})}
		</span>

		<span class="text-gray flex flex-wrap">
			{#each publicProfile?.tags ?? ['WHO', 'AM', 'I'] as tag}
				<span
					class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
				>
					{tag}
				</span>
			{/each}
		</span>
		<QuillView html={publicProfile?.about_you} />
	</div>

	<div
		class="h-20 border-t-gray-100 border-t-2 mt-auto w-full flex items-center justify-evenly"
		class:hidden={isSelf == false}
	>
		{#if user.authStatus === 'signed in'}
			<button
				onclick={() => {
					openComment = true;
				}}
				class="relative"
			>
				<!-- comment -->
				Comments
				<span class="absolute top-[-3px] right-0 text-[9px]">
					{unreadComments.data ? '🔴' : ''}
				</span>
			</button>
		{/if}

		<!-- review -->
		<button
			onclick={() => {
				openReview = true;
			}}
		>
			Review
		</button>
		<button
			onclick={() => {
				openBookmark = true;
			}}
			class:hidden={!isSelf}
		>
			Bookmark
		</button>
		<button onclick={handleSetting} class:hidden={!isSelf}>
			<Settings2 />
		</button>
		<button class:hidden={true} class="opacity-30">Chat</button>
	</div>
</div>
