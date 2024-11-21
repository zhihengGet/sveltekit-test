<script lang="ts">
	import { ratingIcons } from '$lib/data/filter';
	import HtmlViewer from '$lib/editor/HTMLViewer.svelte';
	import Dislike from '$lib/icons/dislike.svelte';
	import Like from '$lib/icons/like.svelte';
	import { useUpdateUserReviewData } from '$lib/queries';
	import { user } from '$lib/state/runes.svelte';
	import type {
		review,
		reviewWithUserInfo,
		user_review_data
	} from '$lib/types';
	import { cn } from '$lib/utils';
	import { keys } from '$lib/utils/getKeys';
	import { timeAgo } from '$lib/utils/timeAgo';
	import type { MouseEventHandler } from 'svelte/elements';
	import IconStats from './IconStats.svelte';
	import Avatar from './avatar.svelte';
	import { useOptimisticUpdate } from '$lib/utils/opmisticUpdate.svelte';
	let {
		hidden = false,
		review,
		showAvatar = false,
		onclick
	}: {
		hidden?: boolean;
		review: Omit<reviewWithUserInfo, 'books'>;
		showAvatar?: boolean;
		onclick: MouseEventHandler<HTMLButtonElement>;
	} = $props();

	const update = useUpdateUserReviewData();
	let self = $derived(user.id == review.user_id);
	//let book = $derived(review.books);
	const user_Data = $derived(review.user_review_data?.[0]);
	$inspect(user_Data).with((type, value) =>
		console.log('test review', type, value)
	);
	let is_like_truth = $derived(
		user_Data?.is_like !== undefined ? user_Data?.is_like : null
	);
	const [curr_like, setValue, debouncer] = useOptimisticUpdate(() => {
		return { dataParent: is_like_truth, mutations: [update] };
	});
	let is_like = $derived(curr_like());
	function dislike() {
		debouncer?.({
			is_like: is_like === false ? null : false,
			id: review.id,
			prev_is_like: curr_like() ?? null
		});
	}
</script>

<div
	class={cn(
		'flex flex-row flex-nowrap  flex-wrap gap-5 overflow-hidden w-[250px] md:w-[300px]  h-320px max-h-320px border-b-1  mb-1 shadow-lg p-2 shrink-0 bg-neutral-100 ' +
			(hidden ? 'hidden ' : '') +
			(is_like === true
				? 'bg-green-100'
				: is_like === null
					? 'bg-white '
					: 'bg-neutral-300 '),
		self ? 'border-amber border-2' : ''
	)}
>
	<span class="h-[100px] w-fit grow-0" class:hidden={!showAvatar}>
		<Avatar
			src={review.avatar_url}
			username={review.username}
			user={{ ...review, id: review.user_id }}
		/>
	</span>
	<div
		class="flex flex-col w-full h-full flex-nowrap overflow-hidden justify-between"
	>
		<button
			onclick={(e) => {
				onclick(e);
			}}
		>
			<div class="line-clamp-1">
				{review.title}
			</div>
			<span class="text-sm truncate text-gray">{review.username}</span>
			<div>
				{#each keys(ratingIcons) as item}
					<span class="">
						{ratingIcons[item]}
						{review[item]}
					</span>
				{/each}
			</div>
			<div class="grow-0 max-h-150px overflow-auto">
				<HtmlViewer html={review.content} />
			</div>
			<div class="text-sm text-gray">{timeAgo(review.updated_at)}</div>
		</button>
		<div class="mt-2 self-center">
			<button
				disabled={user.authStatus != 'signed in'}
				onclick={(e) => {
					update.mutate({
						is_like: is_like ? null : true,
						id: review.id,
						prev_is_like: is_like
					});
					setValue(is_like ? null : true);

					console.log('is like', user_Data);
				}}
			>
				<IconStats count={review.like_count}>
					<Like />
				</IconStats>
			</button>
			<button
				onclick={() => {
					dislike();
					setValue(is_like === false ? null : false);
				}}
				disabled={user.authStatus != 'signed in'}
			>
				<IconStats count={review.dislike_count}>
					<Dislike />
				</IconStats>
			</button>
		</div>
	</div>
</div>
