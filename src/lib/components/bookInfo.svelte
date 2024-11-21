<script lang="ts">
	import ReadButton from '$lib/composite/ReadButton.svelte';
	import ShelfButton from '$lib/composite/shelfButton.svelte';
	import Quote from '$lib/icons/quote.svelte';
	import { useUpdateUserBookData } from '$lib/queries';
	import { user } from '$lib/state/runes.svelte';
	import type { book, bookWithUserInfo } from '$lib/types';
	import BookStats from './BookStats.svelte';
	import Drawer from './Drawer.svelte';
	import Badge from './ui/badge/badge.svelte';

	let { book }: { book: bookWithUserInfo } = $props();
	let open = $state(false);
	let note = $state();
	const up = useUpdateUserBookData();
	let is_beta_reader = $state(book.user_book_data?.[0]?.is_beta_reader);
	$effect(() => {
		is_beta_reader = book.user_book_data?.[0]?.is_beta_reader;
	});
</script>

<div class="max-w-full flex flex-col gap-1">
	<div class="line-clamp-1 font-extrabold text-3xl">{book.title}</div>
	<div class="font-bold text-sm text-ellipsis">
		By: <a
			href="/profile/{book.author_id}"
			class="text-blue link-hover:underline"
		>
			{book.display_name || book.author_name}
			{book.author_id === user.id ? '(Yourself)' : ''}
		</a>
	</div>

	<div class="line-clamp-3"><Quote /> {book.authors_words}</div>
	<div>
		<span class="text-sm capitalize font-semibold">{book.category}</span>
		<Badge variant="outline">{book.audience}</Badge>
	</div>
	<div>
		<ShelfButton {book} />
		<ReadButton {book}>Read Now</ReadButton>
		<button
			class:opacity-50={user.authStatus !== 'signed in'}
			disabled={user.authStatus !== 'signed in'}
			class:hidden={user.authStatus !== 'signed in'}
			onclick={() => {
				up.mutate(
					{
						book_id: book.id,
						is_beta_reader: is_beta_reader === false ? null : false
					},
					{
						onError: () => {
							is_beta_reader = false;
						}
					}
				);
				is_beta_reader = is_beta_reader === false ? null : false;
			}}
			class="text-xs font-400 border-gray-200 border-1 p-1 rounded-full mt-1 {is_beta_reader
				? 'bg-gray-100'
				: is_beta_reader !== false
					? 'bg-gray-100'
					: 'bg-yellow-200 '}"
		>
			Decline Review
		</button>
		<button
			class:opacity-50={user.authStatus !== 'signed in'}
			disabled={user.authStatus !== 'signed in'}
			class:hidden={user.authStatus !== 'signed in'}
			onclick={() => {
				if (is_beta_reader) {
					up.mutate(
						{
							book_id: book.id,
							is_beta_reader: is_beta_reader === true ? null : true
						},
						{
							onError: () => {
								is_beta_reader = true;
							}
						}
					);
					is_beta_reader = is_beta_reader === true ? null : true;
				} else open = !open;
			}}
			class="text-xs font-400 border-gray-200 border-1 p-1 rounded-full mt-1 {is_beta_reader
				? 'bg-yellow-200'
				: is_beta_reader !== false
					? 'bg-gray-100'
					: 'bg-gray-100'}"
		>
			Request Early Review
		</button>
	</div>
	<BookStats {book} />
</div>

<Drawer
	bind:open
	title="Request Beta Review"
	description="By requesting beta review you agree that author might send you email once approved"
>
	{#snippet children()}
		<!-- 	<textarea
			placeholder="200 words note for author(experiemental)"
			bind:value={note}
		></textarea> -->
	{/snippet}
	{#snippet footer()}
		<button
			onclick={() => {
				up.mutate(
					{
						book_id: book.id,
						is_beta_reader: true
					},
					{
						onSuccess: () => {
							is_beta_reader = true;
							open = false;
						}
					}
				);
			}}
		>
			Send Request
		</button>
	{/snippet}
</Drawer>

<style>
</style>
