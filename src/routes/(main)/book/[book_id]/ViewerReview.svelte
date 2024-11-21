<script lang="ts">
	import Sheet from '$components/Sheet.svelte';
	import {
		useGetReviews,
		useGetUserReviewCount,
		useGetUserReviews
	} from '$lib/queries';
	import type {
		book,
		paginateQuery,
		review,
		reviewWithUserInfo
	} from '$lib/types';

	import Review from '$components/Review.svelte';
	import Dropdown from '$components/dropdown.svelte';
	import { ReviewDialog } from '$lib/composite';
	import { flushSync } from 'svelte';
	import PaginateUi from '$components/PaginateUI.svelte';
	import { user } from '$lib/state/runes.svelte';
	import Input from '$components/ui/input/input.svelte';
	import { blur, fade } from 'svelte/transition';
	type p = {
		book?: book;
		open: boolean;
		showUserReview: boolean;
		user_id: string;
	};
	let {
		open = $bindable(false),
		book,
		showUserReview = false,
		user_id
	}: p = $props();
	let selectedReview: reviewWithUserInfo | undefined = $state();
	let openReview = $state(false);
	let pstore: PaginateUi<review> = $state();
	let store: PaginateUi<review> = $derived(
		pstore ?? { pageStore: { search: { regex: '' } } }
	);

	$effect(() => {
		console.log('store changed', pstore, store);
	});
</script>

{#if book || selectedReview?.books}
	<ReviewDialog review={selectedReview} {book} bind:open={openReview} />
{/if}

<Sheet
	bind:open
	title={book?.title ?? ''}
	desc={'# Total Review:' + (store?.totalQueryCountInt ?? 0)}
>
	<Input
		placeholder="search"
		bind:value={store.pageStore.search.regex}
		class={showUserReview != true ? 'hidden' : ''}
	/>
	<hr class="my-2" />
	<PaginateUi
		bind:this={pstore}
		filter={{
			...(book ? { book_id: book.id } : {}),
			...(showUserReview ? { user_id: user_id ?? user.id } : {})
		}}
		useCountQuery={useGetUserReviewCount}
		paginate={{
			size: 10,
			start: 0,
			end: 10,
			orderWithMultiple: {
				like_count: { asc: true },
				user_modified_at: { asc: true }
			}
		}}
		showOrderBy={true}
		showCount={showUserReview}
		useQuery={showUserReview == false ? useGetReviews : useGetUserReviews}
	>
		{#snippet children(data)}
			<div transition:fade={{ delay: 250, duration: 300 }}>
				{#each data ?? [] as review}
					{review.books?.title}
					<Review
						{review}
						onclick={() => {
							selectedReview = review;
							flushSync(() => {
								openReview = true;
							});
						}}
					/>
				{/each}
			</div>
		{/snippet}
	</PaginateUi>
</Sheet>
