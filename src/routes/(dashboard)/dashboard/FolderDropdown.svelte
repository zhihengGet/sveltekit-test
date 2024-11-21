<script lang="ts">
	import Input from '$components/ui/input/input.svelte';
	import { default as Button } from '$lib/components/button.svelte';
	import { useUpdateUserBookData } from '$lib/queries/user/useUserBookData';
	import type { bookWithUserInfo } from '$lib/types';

	import Label from '$components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { useGetAllAuthoredBooks } from '$lib/queries';
	import {
		useGetAuthorFolders,
		useUpdateAuthorFolder
	} from '$lib/queries/folders/authorFolder';
	import {
		useGetShelfFolders,
		useUpdateShelfFolder
	} from '$lib/queries/folders/folders';
	import { user } from '$lib/state/runes.svelte';
	import { includes } from 'lodash-es';
	let {
		book,
		text,
		type
	}: {
		book: bookWithUserInfo;
		text: string;
		type: 'shelf_folder' | 'author_folder';
	} = $props();

	const buckets =
		type == 'author_folder' ? useGetAuthorFolders() : useGetShelfFolders();
	const updateBucket =
		type == 'author_folder' ? useUpdateAuthorFolder() : useUpdateShelfFolder();
	//const updateShelfBucket = useUpdateShelfFolder();
	const update = useUpdateUserBookData();
	const authorBooks = useGetAllAuthoredBooks();
	let open = $state(false);
	let new_bucket = $state('');

	function updateUserBookData(
		folder: string | undefined = undefined,
		isNew: boolean = false
	) {
		let temp = folder?.trim() ?? '';
		update.mutate(
			{
				book_id: book.id,
				userID: user.id,
				[type == 'author_folder' ? 'author_folder' : 'folder']: temp
			},
			{
				onSuccess: () => {
					// now add this folder if new
					// if fail then this book will just be in default folder
					if (
						includes(buckets.data?.folders, temp) == false &&
						temp &&
						!!temp
					) {
						console.log('add new bucket to folder');
						updateBucket.mutate(
							[...(buckets.data?.folders || [])].concat([temp]),
							{
								onSuccess: () => {
									authorBooks.refetch();
								}
							}
						);
					} else {
						authorBooks.refetch();
					}
				}
			}
		);
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button
			size="sm"
			class="truncate"
			variant="ghost"
			isLoading={update.isPending || updateBucket.isPending}
		>
			{text}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-80 max-h-300px overflow-auto">
		<div class="grid gap-4">
			<div class="space-y-2">
				<h4 class="font-medium leading-none">{book.title}</h4>
				<p class="text-sm text-muted-foreground">
					Folder:{book.user_book_data?.[0]?.author_folder}
				</p>
			</div>
			<div class="grid gap-2">
				<div class="grid grid-cols-5 items-center gap-4">
					<Label for="width">Add</Label>
					<Input id="width" class="col-span-2 h-8" bind:value={new_bucket} />
					<Button
						variant="ghost"
						class="bg-blue-200 col-span-2"
						onclick={() => {
							updateUserBookData(new_bucket);
						}}
					>
						To {new_bucket}
					</Button>
				</div>
				<Button
					variant="ghost"
					class="bg-blue-100"
					onclick={() => {
						updateUserBookData('');
					}}
				>
					default
				</Button>
				{#each buckets.data?.folders || [] as item}
					<Button
						variant="ghost"
						class="bg-blue-100"
						onclick={() => {
							updateUserBookData(item);
						}}
					>
						{item}
					</Button>
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
