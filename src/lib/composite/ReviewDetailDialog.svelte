<script lang="ts">
	import Dialog from '$components/dialog.svelte';
	import { Input } from '$components/ui/input';
	import { Button } from '$lib/components';
	import { reviewLimits } from '$lib/data/constants';
	import { ratingIcons } from '$lib/data/filter';
	import SimpleEditor from '$lib/editor/EditorLazy.svelte';
	import HtmlViewer from '$lib/editor/HTMLViewer.svelte';
	import QuillEditor from '$lib/editor/QuillEditor.svelte';
	import {
		useCreateReview,
		useDeleteReview,
		useGetUserReview,
		useUpdateUserReview
	} from '$lib/queries';
	import { review_schema } from '$lib/schema/reviewSchema';
	import { user } from '$lib/state/runes.svelte';
	import type { book, review, reviewWithUserInfo } from '$lib/types';
	import type { SelectedReview } from '$lib/types/bookPage';
	import { getSize, getStringInfo } from '$lib/utils/fileUtils';
	import { keys } from '$lib/utils/getKeys';
	import { tick } from 'svelte';
	import type { ZodError } from 'zod';
	//Use: display review create review
	type props = {
		review: review | reviewWithUserInfo | SelectedReview | null;
		open: boolean;
		book?: book;
	};
	let { review, open = $bindable(), book: cache }: props = $props();
	const createReview = useCreateReview();
	const update = useUpdateUserReview();
	const del = useDeleteReview();

	const book = $derived(cache ?? review?.books);
	//  run only if review is empty
	//const rev = useGetReview({ bookID: book.id, enable: !!review });
	let editable = $state<Partial<review>>({
		user_id: user.id,
		content: review?.content,
		title: review?.title
	});
	$effect(() => {
		editable.user_id = user.id;
	});
	$effect(() => {
		if (review?.content || editable.content !== review?.content) {
			Object.assign(editable, review, { books: undefined });
			console.log('made it same!');
		}
		/* const b = review?.content;
		const c = editable.content;
		debugger; */
	});
	let Selfreview = useGetUserReview(() => book.id);
	let isSelf = $derived(review == null || editable.user_id === user.id);
	let validated = $derived(review_schema.safeParse(editable));
	//$inspect('validated', validated);
	async function handelSave() {
		await tick();
		if (validated && editable && editable.user_id == user.id) {
			if (validated.success) {
				console.log(
					'validated successful',
					validated.data,
					review?.content?.length
				);
				editable.book_id = book.id;
				if (!Selfreview.data || 'id' in Selfreview.data == false) {
					createReview.mutate(editable);
				} else {
					update.mutate({ new: editable, old: Selfreview.data });
				}
			}
		}
	}

	async function handleDelete() {
		if (review && 'id' in review) {
			await del.mutateAsync(
				{ id: review?.id },
				{
					onSuccess: () => {
						open = false;
					}
				}
			);
		}
	}

	let error = $derived(validated?.error as ZodError);

	let disable = $derived(
		createReview.isPending ||
			editable.user_id != user.id ||
			update.isPending ||
			del.isPending
	);

	/* 
		$effect(() => {
			console.log('dialog ', review, editable);
		}); 
	*/
</script>

{#if editable}
	<!-- for view and edit -->
	<Dialog
		title={review?.title ?? 'No Title'}
		desc={'ID:' + review?.id}
		class="overflow-auto"
		bind:open
	>
		<div class="overflow-auto max-h-">
			<h4 class="text-neutral-500 truncate">
				{book.title}<!-- {review?.user_id != user?.id} -->
			</h4>
			<!-- {JSON.stringify(review)} -->
			{#each keys(ratingIcons) as item}
				<div class="relative my-5">
					<label
						for="default-range"
						class="block text-sm font-medium text-gray-900 dark:text-white capitalize"
					>
						<span>{ratingIcons[item]}</span>
						{item.replaceAll('_', ' ')} -
						{editable[item]}
					</label>
					<input
						id="default-range"
						type="range"
						disabled={disable}
						bind:value={editable[item]}
						min="1"
						max="100"
						size="1"
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>
			{/each}

			<form class="">
				<Input
					bind:value={editable.title}
					placeholder="title"
					disabled={disable}
				/>
			</form>
			{#if editable.user_id === user.id || !editable.user_id}
				{#each error?.issues
					?.map((v) => v.message)
					.filter((v) => !!v) ?? [] as msg}
					<div class="text-red">❌{msg}</div>
				{/each}
				<!-- 	<SimpleEditor
					initialHTML={review?.content ?? ''}
					isAutocomplete={false}
					isMaxLength={true}
					isCharLimitUtf8={false}
					dev={false}
					onInput={(html: string) => {
						editable.content = html;
					}}
				/> -->
				<QuillEditor
					initialHTML={review?.content}
					bind:value={editable.content}
					placeholder="Be nice and be critical"
					maxLength={reviewLimits.MAX_BODY_LENGTH}
				/>
				<span class="text-gray text-sm">
					{getStringInfo({
						html: editable.content ?? '',
						maxByte: reviewLimits.MAX_REVIEW_CONTENT_BYTE,
						maxLength: reviewLimits.MAX_BODY_LENGTH,
						useTextContext: true
					}).message}
				</span>
			{:else}
				<HtmlViewer html={editable.content} />
			{/if}
		</div>

		{#snippet footer()}
			<div class:hidden={editable?.user_id != user.id}>
				<Button
					onclick={handleDelete}
					isLoading={del.isPending}
					disabled={disable}
					variant="outline"
				>
					Delete
				</Button>
				<Button
					onclick={handelSave}
					isLoading={update.isPending || createReview.isPending}
					disabled={disable || validated.success === false}
					variant="outline"
				>
					Save
				</Button>
			</div>
		{/snippet}
	</Dialog>
{/if}
