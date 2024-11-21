<script lang="ts">
	import ArtworkCard from '$components/ArtworkCard.svelte';
	import Drawer from '$components/Drawer.svelte';
	import PaginateUi from '$components/PaginateUI.svelte';
	import Button from '$components/button.svelte';
	import Dropdown from '$components/dropdown.svelte';
	import { Item } from '$components/ui/accordion';
	import Input from '$components/ui/input/input.svelte';
	import { getPublicArtworkUrlSync } from '$lib/queries/storage/ObjectKey';
	import {
		useDeleteArtwork,
		useGetArtworks
	} from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import type { artworkWithBook } from '$lib/types';
	import ArtworkForm from '../../routes/(main)/profile/ArtworkCreateForm.svelte';
	import { Toggle } from '$lib/components/ui/toggle/index';
	import CreateArtworkButton from './CreateArtworkButton.svelte';
	import { removeNil } from '$lib/queries/util';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';

	let {
		book_id,
		chapter_id,
		user_id,
		text = 'View'
	}: {
		book_id?: number;
		chapter_id?: number;
		user_id?: string;
		text?: string;
	} = $props();
	let isSelf = $derived(user.authStatus === 'signed in');
	let open = $state(false);
	let pager: PaginateUi = $state();

	const filter = $derived(removeNil({ book_id, chapter_id, user_id }));
</script>

<Drawer
	bind:open
	title="Artworks"
	description="You can upload 200 artworks! Will likely increase in the future."
	class="w-screen md:w-8/10 md:max-w-8/10 xl:max-w-6/10 max-h-9/10"
>
	<div>
		<div class="flex justify-center flex-wrap items-center gap-2">
			<Input
				class="w-50 inline-block "
				placeholder="Search by name"
				oninput={(e) => {
					pager?.deb(e.target.value ?? '');
				}}
			/>
			<span class="flex items-center gap-1 mx-2">
				<div class="w-50px">
					<input
						type="checkbox"
						oninput={() => {
							console.log('checked');
							pager.pageStore.filter.ai = !pager.pageStore.filter.ai;
						}}
					/>
					AI
				</div>
				<div class="w-fit text-sm">
					<input
						type="checkbox"
						oninput={() => {
							console.log('checked');
							pager.pageStore.filter.endorsed =
								!pager.pageStore.filter.endorsed;
						}}
					/>
					Endorsed By Author
				</div>

				<!-- 	<CreateArtworkButton
					onClick={() => {
						open = false;
					}}
					buttonText="+Upload"
				/> -->
				<Dropdown
					buttonString="Sort"
					items={{
						'': [
							{
								str: 'Created At',
								onClick: () => {
									const asc =
										pager.pageStore.paginate?.orderWithMultiple?.[
											'created_at'
										] ?? false;

									pager.pageStore.paginate.orderWithMultiple = {
										created_at: { asc: !asc }
									};
								}
							}
						]
					}}
				/>
			</span>
		</div>
		<div class="pt-5">
			<PaginateUi
				useQuery={useGetArtworks}
				{filter}
				paginate={{ start: 0, end: 10, size: 10, orderWithMultiple: {} }}
				bind:this={pager}
			>
				{#snippet Render(data)}
					<div class="flex flex-wrap items-center">
						{#each data as work}
							<ArtworkCard artwork={work} />
						{/each}
					</div>
				{/snippet}
			</PaginateUi>
		</div>
	</div>
</Drawer>
<Button
	class="my-2 underline "
	variant="ghost"
	onclick={() => {
		open = true;
	}}
>
	+ {text}
</Button>
