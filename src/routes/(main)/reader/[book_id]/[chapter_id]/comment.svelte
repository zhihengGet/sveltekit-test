<script lang="ts">
	import ChatIcon from '$lib/icons/chat/ChatIcon.svelte';
	import { useUpdateUserCommentData } from '$lib/queries/user/userCommentData';
	import type { comment, commentJoined } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	import IconStats from '$components/IconStats.svelte';
	import Avatar from '$components/avatar.svelte';
	import QuillView from '$lib/editor/QuillView.svelte';
	import HeartBroke from '$lib/icons/like/HeartBroke.svelte';
	import HeartIcon from '$lib/icons/like/HeartIcon.svelte';
	import { MissingUserData } from '$lib/queries/base/errors';
	import { useDeleteComment } from '$lib/queries/comment/deleteComment';
	import { user } from '$lib/state/runes.svelte';
	import { twMerge } from 'tailwind-merge';
	import { timeAgo } from '$lib/utils/timeAgo';
	import X from 'lucide-svelte/icons/x';
	import { fade, fly } from 'svelte/transition';
	import { useOptimisticUpdate } from '$lib/utils/opmisticUpdate.svelte';
	let dispatch = createEventDispatcher<{ showReply: comment }>();
	let {
		data: comment,
		displayReply = true,
		class: classes,
		disableActions = false
	}: {
		data: commentJoined;
		disableActions?: boolean;
		displayReply?: boolean;
		class?: string;
	} = $props();
	if (!comment.user_comment_data) {
		console.error(MissingUserData);
		throw MissingUserData;
	}
	const update = useUpdateUserCommentData();
	const remove = useDeleteComment();

	const user_data = $derived(comment.user_comment_data?.[0]);
	const book = $derived(comment.books);
	const is_like_original = $derived(
		user_data != undefined ? user_data.is_like : null
	);

	const isSelf = $derived(comment.user_id === user.id);

	$effect(() => {
		//	console.error('comment empty', comment);
		if (!comment?.content) console.error('error empty content', comment);
	});

	const [value, setValue] = useOptimisticUpdate(() => {
		return { dataParent: is_like_original, mutations: [update] };
	});
	let is_like = $derived.by(value);
</script>

<div
	class={twMerge(
		'relative h-[300px] flex flex-col 2 gap-4 mb-8 border rounded-lg shadow-lg ' +
			(isSelf ? 'border-1 border-amber ' : '') +
			(is_like === true
				? 'bg-gradient-to-b from-green-100	'
				: is_like === null
					? 'bg-neutral-100'
					: 'bg-neutral-300'),
		classes
	)}
	in:fly={{ y: 5, duration: 500 }}
	out:fade={{ duration: 500 }}
>
	<div
		class="relative flex gap-4 p-1 h-fit {isSelf ? 'place-content-center' : ''}"
	>
		<Avatar
			src={comment?.avatar_url}
			user={{ username: comment.username }}
			userId={comment.user_id}
			class="relative rounded-lg mb-4 bg-white border h-20 w-20 "
		/>
		<div class={twMerge('flex flex-col w-full h-100px truncate')}>
			<div class="flex flex-row justify-between">
				<p class="relative text-xl whitespace-nowrap truncate overflow-hidden">
					{isSelf == false && comment?.books
						? comment.username
						: book?.title || ''}
					<!-- we do joins so sometime we could have data?.books?.title -->
				</p>
			</div>
			<p class="text-gray-400 text-sm truncate">
				{timeAgo(new Date(comment.updated_at))}
			</p>
			<p class="text-gray-400 text-sm truncate capitalize">
				{comment.tags?.join(' ')}
			</p>
			<!-- 		<p class="text-gray-400 text-sm">
				{comment.username}
			</p> -->
			<span class="flex gap-2 h-fit">
				<!-- nested comment -->
				<button
					class:hidden={displayReply === false}
					onclick={() => dispatch('showReply', comment)}
				>
					<ChatIcon />
				</button>

				<!-- like -->
				<button
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						update.mutate({
							id: comment.id,
							is_like: is_like === true ? null : true,
							prev_is_like: is_like
						});
						setValue(is_like === true ? null : true);
					}}
					disabled={disableActions}
				>
					<IconStats count={comment.like_count}><HeartIcon /></IconStats>
				</button>
				<!-- dislike -->
				<button
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						update.mutate({
							id: comment.id,
							is_like: is_like === true || is_like === null ? false : null,
							prev_is_like: is_like
						});
						setValue(is_like === true || is_like === null ? false : null);
					}}
					class="pt-1"
				>
					<IconStats count={comment.dislike_count}>
						<HeartBroke class="inline-block h-[24px] w-[24px]" />
					</IconStats>
				</button>
				<button
					class:hidden={comment.user_id != user.id}
					class="hover:text-red"
					onclick={(e) => {
						remove.mutate({ id: comment.id });
					}}
					disabled={disableActions}
				>
					<X />
				</button>
			</span>
		</div>
	</div>
	<div class="text-gray-500 overflow-auto">
		<QuillView html={comment?.content ?? 'empty'} />
	</div>
	<!-- 	<HtmlViewer html={comment?.content ?? 'empty'} /> -->
</div>

<style>
	/* your styles go here */
</style>
