<script lang="ts">
	import Sheet from '$components/Sheet.svelte';

	import type { comment } from '$lib/types';

	import {
		useGetHasUnreadReplies,
		useGetUserCommentCount,
		useGetUserComments,
		useGetBookComments
	} from '$lib/queries/comment/getChapterComment.svelte';

	import Dropdown from '$components/dropdown.svelte';
	import { Input } from '$components/ui/input';
	import { useMarkCommentRead } from '$lib/queries/comment/updateComment';
	import Comment from '../../reader/[book_id]/[chapter_id]/comment.svelte';

	import PaginateUi from '$components/PaginateUI.svelte';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import type { SvelteComponent } from 'svelte';
	import { user } from '$lib/state/runes.svelte';
	import { type book } from '$lib/types';
	let {
		open = $bindable(false),
		type = 'user',
		userid,
		book
	}: {
		type?: 'book' | 'user';
		book?: book;
		open: boolean;
		userid: string;
	} = $props();
	// get book comment
	// get user comment
	const numberComment = useGetUserCommentCount(() => userid);
	const hasUn = userid === user.id ? useGetHasUnreadReplies() : { data: null };
	const isSelf = $derived(userid === user.id);
	let stop = false;
	const markread = useMarkCommentRead();
	$effect(() => {
		if (hasUn.data && hasUn?.data > 0 && user.id === userid && stop === false) {
			stop = true;
			markread.mutate([]); // mark all
		}
	});
	let sort: keyof comment = $state('like_count');
	let toggleRead = $state(true);
	let pager: SvelteComponent<PaginateUi<comment>> = $state({
		pageStore: { search: { regex: '' } }
	});
	$effect(() => {
		pager.pageStore.filter.has_unread_child = !toggleRead;
	});
	/* $effect(() => {
		pager.pageStore.filter.has_unread_child = !toggleRead;
	}); */
</script>

<Sheet bind:open title="Edit Comments" desc="Review your comments...">
	{#if type === 'user'}
		<span>Total Comments: #{numberComment.data}</span>
		{#if isSelf}
			<div class="mb-2 text-[0.8em] font-bold my-1">
				<Checkbox id="toggle-unread" bind:checked={toggleRead} />
				<label for="toggle-unread">
					{toggleRead
						? 'Show Comments With New Replies[' + hasUn.data + ']'
						: 'Show All'}
				</label>
			</div>
		{/if}

		<div>
			<labe for="search-book" class="hidden">Search By Book Title</labe>
			<Input
				id="search-book"
				placeholder="filter by book name-case sensitive"
				class="mb-5"
				bind:value={pager.pageStore.search.regex}
			/>
		</div>
	{/if}

	<PaginateUi
		filter={type === 'book'
			? { book_id: book?.id }
			: { has_unread_child: false, user_id: userid }}
		showOrderBy={true}
		paginate={{
			start: 0,
			end: 6,
			size: 6,
			orderWithMultiple: {
				like_count: { asc: true },
				user_modified_at: { asc: true }
			}
		}}
		showCount={false}
		useQuery={type === 'user' ? useGetUserComments : useGetBookComments}
		bind:this={pager}
	>
		{#snippet Render(data)}
			<div>
				{#each data ?? [] as comment}
					<a
						href="/reader/{comment.book_id}/{comment.chapter_id}?section={encodeURI(
							comment.section_id
						)}&parent={comment.parent_id ?? 0}&comment_id={comment.id}"
						target="_blank"
						class=" mb-10"
					>
						<span class="text-gray">Title: {comment.books?.title}</span>
						<Comment data={comment} />
					</a>
				{/each}
			</div>
		{/snippet}
	</PaginateUi>
</Sheet>
