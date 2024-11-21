<script lang="ts">
	import Sheet from '$components/Sheet.svelte';

	import type { book, comment } from '$lib/types';

	import {
		useGetHasUnreadReplies,
		useGetUserCommentCount,
		useGetUserComments,
		useGetBookComments
	} from '$lib/queries/comment/getChapterComment.svelte';

	import Dropdown from '$components/dropdown.svelte';
	import { Input } from '$components/ui/input';
	import { useMarkCommentRead } from '$lib/queries/comment/updateComment';

	import PaginateUi from '$components/PaginateUI.svelte';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import type { SvelteComponent } from 'svelte';
	import Comment from '../../(main)/reader/[book_id]/[chapter_id]/comment.svelte';
	import { comment_type } from '$lib/schema/commentSchema';
	let { open = $bindable(false), book }: { book: book; open: boolean } =
		$props();
	let pager: SvelteComponent<PaginateUi<comment>> = $state({
		pageStore: { search: { regex: '' } }
	});
	const ANY_TYPE = 'any';
	let types: string[] = comment_type.concat([ANY_TYPE]);
</script>

<Sheet bind:open title="Edit Comments" desc="Review your comments...">
	<Dropdown
		buttonString="Filter By Type"
		items={{
			types: types.map((v) => {
				return {
					str: v,
					onClick: () => {
						if (v == ANY_TYPE) {
							pager.pageStore.filter.tags = undefined;
						}
						if (v !== ANY_TYPE) pager.pageStore.filter.tags = [v];
					}
				};
			})
		}}
	></Dropdown>
	<PaginateUi
		filter={{ book_id: book.id }}
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
		useQuery={useGetBookComments}
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
						class=" border-1 mb-10"
					>
						<!-- <h4>{comment.books?.title}</h4> -->
						<Comment data={comment} />
					</a>
				{/each}
			</div>
		{/snippet}
	</PaginateUi>
</Sheet>
