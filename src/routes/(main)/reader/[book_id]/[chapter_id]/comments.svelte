<script lang="ts">
	import PaginateUi from '$components/PaginateUI.svelte';
	import Spinner from '$lib/icons/spinner.svelte';
	import {
		useGetComments,
		useGetParentComment,
		useGetUserComment
	} from '$lib/queries/comment/getChapterComment.svelte.js';
	import type { comment } from '$lib/types';
	import Comment from './comment.svelte';
	import {
		CommentStack,
		addCommentToStack,
		parentComment,
		chapterMetaStore,
		currentComment,
		resetBackward
	} from './store.svelte';
	import Alert from '$components/Alert.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { Button } from '$lib/components/ui/button';

	// forward
	const handleReplies = (data: { detail: comment }) => {
		console.log('handle forward reply', data.detail);
		addCommentToStack(data.detail);
		//backward pass
		//resetBackward();
		//forward pass
		currentComment.filter.parent_id = data.detail.id;
		currentComment.filter.section_id = data.detail.section_id;
	};
	const parent_comment = useGetParentComment();

	const filter = $derived(currentComment.filter);
	const user_comment = useGetUserComment(() => filter);
	// check if this section_id still exists or not due to chapter content update
	let exists = $derived(
		chapterMetaStore.section_ids.has(currentComment.filter.section_id ?? 'NONE')
	);
	$effect(() => {
		parentComment.id = currentComment.filter.parent_id;
	});
	$effect(() => {
		Object.assign(parentComment, parent_comment.data);
		parentComment.hasParent = !!parent_comment.data?.parent_id;
		parentComment.isFetching = parent_comment.isFetching;
	});
</script>

{#if exists === false}
	<!-- 	{Array.from(chapterMetaStore.section_ids)} -->
	<Alert>
		Uh-oh! The section of the novel which this comment was created for
		disappeared!
	</Alert>
{/if}
<!-- <pre>{JSON.stringify(parentComment, null, 2)}</pre>
<pre>{JSON.stringify(CommentStack, null, 2)}</pre>
<pre>{JSON.stringify(currentComment.filter, null, 2)}</pre> -->
<!-- forward/backward pass render :self comment -->

<!-- render fetch more button for backward pass -->

{#if parent_comment.data}
	<Collapsible.Root class="max-w-9/10">
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="sm" class="p-0">
				<Badge variant="default">
					Show Original Comment <ChevronsUpDown class="h-4" />
				</Badge>
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content class="space-y-2">
			<Comment
				data={parent_comment.data}
				displayReply={false}
				class="op-80 hover:op-100"
			/>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- should we render fetch more  -->
	<!-- {#if parent_comment.data && backwardCommentStore.comment_id > -1 && backwardCommentStore.fetchMoreComments === false}
		<button
			onclick={() => {
				commentReaderStore.filter.parent_id = parent_comment.data?.parent_id; // fetch peer comments
				commentReaderStore.filter.section_id = parent_comment.data?.section_id;
				backwardCommentStore.fetchMoreComments = true;
			}}
		>
			Loading More <ChevronDownIcon class="inline" />
		</button>
	{/if} -->
{/if}
<hr class="bg-blue font-bold h-[0.5px]" />

{#if user_comment.data}
	<Badge variant="secondary">Your Comment</Badge>

	<Comment
		data={user_comment.data}
		on:showReply={handleReplies}
		class="op-90 hover:op-100"
	/>
{:else if user_comment.isLoading}
	<Spinner />
{/if}

<!-- forward pass and backward pass render list -->
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
	class="mx-auto my-2"
>
	<path d="M15 12h-5" />
	<path d="M15 8h-5" />
	<path d="M19 17V5a2 2 0 0 0-2-2H4" />
	<path
		d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"
	/>
</svg>
<!-- paginate -->
<PaginateUi showCount={false} useQuery={useGetComments}>
	{#snippet Render(data)}
		<div>
			{#each data ?? [] as comment}
				{#if comment.id != parent_comment?.data?.id}
					<Comment data={comment} on:showReply={handleReplies} />
				{/if}
			{/each}
		</div>
	{/snippet}
</PaginateUi>
