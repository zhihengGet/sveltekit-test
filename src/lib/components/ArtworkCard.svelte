<script lang="ts">
	import { queryKey, type SelectedBook } from '$lib/queries';
	import { getPublicArtworkUrlSync } from '$lib/queries/storage/ObjectKey';
	import {
		useDeleteArtwork,
		useEndorseArtwork
	} from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import type { artworkWithBook } from '$lib/types';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Drawer from './Drawer.svelte';
	import IconStats from './IconStats.svelte';
	import Button from './button.svelte';
	import { client } from '$lib/queries/api';
	import X from 'lucide-svelte/icons/x';
	import { useOptimisticUpdate } from '$lib/utils/opmisticUpdate.svelte';

	let openPreviewImage = $state(false);
	let {
		artwork,
		book
	}: {
		artwork: artworkWithBook;
		book?: SelectedBook;
		onclick?: (artwork: MouseEvent) => unknown;
		previewWork?: artworkWithBook;
	} = $props();
	const d = useDeleteArtwork();
	const end = useEndorseArtwork();
	let preview_url = $derived(
		getPublicArtworkUrlSync({
			book_id: artwork.book_id,
			chapter_id: artwork.chapter_id,
			artwork_id: artwork.artwork_id,
			user_id: artwork.user_id
		})
	);
	const user_artwork_data = $derived(
		artwork.user_artwork_data[0] ?? { is_like: null }
	);
	//const is_like = $derived(user_artwork_data?.is_like ?? null);
	const can_endorse = $derived(
		(artwork.books.author_id ?? book?.author_id) === user.id && user.id
	);
	const tansClient = useQueryClient();
	const update = createMutation(() => {
		return {
			mutationFn: async ({
				is_like,
				prev_is_like
			}: {
				is_like: boolean | null;
				prev_is_like: boolean | null;
			}) => {
				/*if (artwork.user_artwork_data.length > 0)
				artwork.user_artwork_data[0].is_like = is_like; */
				const post = client.rest.api.artworks.protected.upsert_user_info.$post;
				const res = await post({
					json: {
						is_like,
						artwork_id: artwork.artwork_id,
						prev_is_like: prev_is_like
					}
				});
				const r = await res.json();
				if (res.status !== 200)
					throw new Error(
						r?.message ?? 'Error with update artwork like/dislike'
					);
				return r;
			},

			onSuccess: (data) => {
				tansClient.setQueriesData(
					{ queryKey: queryKey.getArtwork() },
					(old: artworkWithBook[] | undefined) => {
						if (Array.isArray(old)) {
							for (let x of old) {
								if (x.artwork_id === data.artwork_id)
									x.user_artwork_data = [data];
							}
						}
						return $state.snapshot(old);
					}
				);
			}
		};
	});
	let img: HTMLImageElement | undefined = $state();
	const [currValue, setValue] = useOptimisticUpdate(() => {
		return {
			dataParent: {
				is_like: user_artwork_data?.is_like ?? null,
				endorsed: artwork.endorsed
			},
			mutations: [update, end]
		};
	});
	const is_like = $derived(currValue().is_like);
</script>

<Drawer
	bind:open={openPreviewImage}
	title={artwork?.name + (artwork.ai ? '(AI)' : '')}
	description={artwork.description ?? ''}
	class="flex flex-col justify-center items-center md:w-[80vw] max-h-[90vh] md:max-h-[80vh]"
>
	<Button
		variant="link"
		href="/profile/{artwork.user_id}"
		class={artwork.user_id == user.id ? 'hidden' : ''}
	>
		View Author Profile
	</Button>
	<img
		class="object-contain w-8/10 max-h-9/10 h-9/10 border-1"
		src={preview_url || 'https://placehold.co/600x400'}
		alt="invalid"
		bind:this={img}
	/>
	<span class="text-sm">
		({img?.naturalWidth} px
		<X class="inline" size="15" />
		{img?.naturalHeight} px)
	</span>
	{#if artwork.endorsed}
		<h1 class="rounded p-1 text-amber-600 text-sm inline-block text-center">
			<p class="text-sm">Endorsed🎖️</p>
		</h1>
	{/if}

	<!-- {#snippet footer()}
		<h1
			class="bg-zinc-100 rounded p-1 text-amber-900 text-sm w-fit inline-block pr-3"
		>
			🤖 AI-Generated
		</h1>
	{/snippet} -->
</Drawer>
<div
	class="inline-flex flex-col m-2 w-2/5 max-w-50 {artwork.endorsed
		? 'bg-gradient-to-t from-green-50 via-orange-50 to-pink-50 '
		: ''}"
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={(e) => {
			e.preventDefault();
			openPreviewImage = !openPreviewImage;
			//previewWork = artwork;
		}}
	>
		<figure class="aspect-square object-contain relative">
			<img
				src={preview_url}
				alt={`${artwork.name}`}
				class="w-full h-full border-1"
			/>
			{#if artwork.ai && !(artwork.user_id === user.id)}
				<div
					class="absolute top-[-15px] right-[-10px] border-blue-50 w-2em rounded"
				>
					🤖
				</div>
			{/if}
			{#if can_endorse}
				<button
					class="absolute bottom-0 right-[-10px] bg-blue-50 p-1 rounded text-sm opacity-80 hover:opacity-100"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						end.mutate({ ...artwork, endorsed: !currValue().endorsed });
						setValue({ ...currValue(), endorsed: !currValue().endorsed });
					}}
					disabled={d.isPending}
				>
					{currValue().endorsed ? 'Undo❌' : 'Endorse✅'}
				</button>
			{/if}
			{#if artwork.user_id === user.id}
				<Button
					size="sm"
					variant="link"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						d.mutate(artwork);
					}}
					class="absolute top-[-15px] right-[-10px] border-blue-100 w-2em rounded"
					isLoading={d.isPending}
				>
					❌
				</Button>
			{/if}
			<figcaption
				class="absolute bottom-[1em] text-amber text-center w-full mix-blend-difference hidden"
			>
				{artwork.name}
			</figcaption>
		</figure>
	</div>
	<hr />
	<div
		class="h-10 flex justify-center items-center justify-between w-50 max-w-full {is_like
			? 'bg-green-300'
			: is_like === false
				? 'bg-gray-300 text-black'
				: 'bg-amber-50'}"
	>
		<button
			class="flex max-w-full justify-center items-center overflow-hidden grow-1"
		>
			<span class="truncate break-all">
				{artwork.name}
			</span>
			<!-- <EllipsisVerticalIcon class="grow-0" /> -->
		</button>
		<span class="shrink-0">
			<IconStats count={artwork.like_count}>
				<button
					disabled={user.authStatus !== 'signed in'}
					onclick={() => {
						update.mutate({
							is_like: is_like === true ? null : true,
							prev_is_like: is_like
						});
						setValue({
							...currValue(),
							is_like: is_like === true ? null : true
						});
					}}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-5"
				>
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
						class="w-5 h-5 fill-primary"
					>
						<path
							d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
						></path>
					</svg>
				</button>
			</IconStats>
			<IconStats count={artwork.dislike_count}>
				<button
					disabled={user.authStatus !== 'signed in'}
					onclick={() => {
						update.mutate({
							...currValue(),
							prev_is_like: is_like,
							is_like: is_like === false ? null : false
						});
						setValue({
							...currValue(),
							is_like: is_like === false ? null : false
						});
					}}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10"
				>
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
						class="w-5 h-5 fill-red-500"
					>
						<path
							d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
						></path>
						<path d="m12 13-1-1 2-2-3-3 2-2"></path>
					</svg>
				</button>
			</IconStats>
		</span>
		<!-- {#if artwork.user_id === user.id}
			<Button
				size="sm"
				variant="link"
				onclick={() => {
					d.mutate(artwork);
				}}
				isLoading={d.isPending}
			>
				❌
			</Button>
		{/if} -->
		<!-- {#if artwork.user_id === user.id && can_endorse}
			<Separator orientation="vertical" />
		{/if} -->
		<!-- {#if can_endorse}
			<Button
				size="sm"
				variant="link"
				onclick={() => {
					end.mutate(artwork);
				}}
				isLoading={d.isPending}
			>
				{artwork.endorsed ? 'Revert ❌' : 'Endorse ✅'}
			</Button>
		{/if} -->
	</div>
</div>

<style>
</style>
