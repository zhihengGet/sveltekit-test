<script lang="ts">
	import { Button } from '$lib/components';
	import { useCreateComment } from '$lib/queries/comment/createComment.js';
	import { useDeleteComment } from '$lib/queries/comment/deleteComment';
	import { useGetUserComment } from '$lib/queries/comment/getChapterComment.svelte';
	import { useUpdateComment } from '$lib/queries/comment/updateComment';

	import { MAX_CHAPTER_COMMENT_LENGTH } from '$lib/data/constants';
	import QuillEditor from '$lib/editor/QuillEditor.svelte';
	import { user } from '$lib/state/runes.svelte';
	import { CommentStack, currentComment } from './store.svelte';
	import { untrack } from 'svelte';
	import { comment_type } from '$lib/schema/commentSchema';
	import Toggle from '$components/ui/toggle/toggle.svelte';
	import Dialog from '$components/dialog.svelte';

	const createComment = useCreateComment();
	const update = useUpdateComment();
	const remove = useDeleteComment();

	let filter = $derived(currentComment.filter);
	let user_comment = useGetUserComment(() => filter);

	let comment_value = $state('');
	let isLoggedIn = $derived(user.authStatus == 'signed in');

	let isFetching = $derived(
		createComment.isPending ||
			user_comment.isLoading ||
			user.authStatus == 'signing in' ||
			update.isPending
	);
	let status = $derived(
		user_comment.data?.content?.length ? 'Published' : 'Draft'
	);
	let text = $derived(
		user.authStatus === 'signed in'
			? status == 'Published'
				? 'Update'
				: 'Save'
			: 'Please sign in'
	);
	let type = $state('plot');
	$effect(() => {
		if (user_comment.data?.id) {
			untrack(() => {
				if (comment_value !== user_comment.data?.content) {
					comment_value = user_comment.data?.content;
				}
			});
		}
	});

	function handleDelete() {
		if (user_comment.data?.id) {
			remove.mutate({ id: user_comment.data?.id });
		}
		return true;
	}
	function handleSubmit() {
		if (CommentStack.length > 0 && !CommentStack.at(-1)?.has_unread_child) {
			// if is a child comment
		}
		const select = Object.keys(selected).filter((v) => selected[v]);

		if (!user_comment.data?.id) {
			createComment.mutate({
				...currentComment.filter,
				content: comment_value,
				tags: select
			});
		} else {
			update.mutate({
				...currentComment.filter,
				content: comment_value,
				id: user_comment.data.id,
				tags: select
			});
		}
		return true;
	}
	let state = $state(false);
	let selected = $state({});

	$effect(() => {
		if (Object.keys(selected).length == 0)
			for (let x of user_comment?.data?.tags ?? []) {
				selected[x] = true;
			}
	});
</script>

<button
	onclick={() => {
		state = true;
	}}
	class="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3
	    font-medium leading-none text-magnum-700 shadow hover:opacity-75"
>
	{text}
</button>
<Dialog
	class="w-9/10 md:w-8/10 lg:w-1/2 overflow-auto"
	title="Write Comment"
	bind:open={state}
>
	<div class="flex flex-col gap-2 p-1">
		<div>
			<div class=" font-bold">Select Comment Types</div>
			<div class="flex">
				{#each comment_type as type}
					<Toggle
						size="sm"
						class="mx-1 capitalize"
						onPressedChange={(e) => {
							selected[type] = e;
						}}
						controlledPressed={true}
						pressed={selected[type]}
						disabled={user_comment.isLoading}
					>
						{type}
					</Toggle>
				{/each}
			</div>
		</div>
		<QuillEditor
			bind:value={comment_value}
			maxLength={MAX_CHAPTER_COMMENT_LENGTH}
			type="limited"
			debounceInput={false}
			initialHTML={comment_value.length !== 0 ? comment_value : '<p>hi</p>'}
		/>
	</div>
	{#snippet footer()}
		<span>
			<Button
				class="inline-flex h-8 items-center justify-center rounded-sm
		   px-4 font-medium leading-none text-zinc-600"
				onclick={() => {
					close();
				}}
				variant="outline"
			>
				Cancel
			</Button>
			<Button
				class="inline-flex bg-red h-8 items-center justify-center rounded-sm
	   px-4 font-medium leading-none "
				onclick={() => {
					handleDelete();
				}}
				variant="destructive"
			>
				Delete
			</Button>
			<Button
				class="inline-flex h-8 items-center justify-center rounded-sm
		   px-4 font-medium leading-none"
				type="submit"
				variant="default"
				isLoading={isFetching}
				onclick={handleSubmit}
			>
				{text}
			</Button>
		</span>
	{/snippet}
</Dialog>
