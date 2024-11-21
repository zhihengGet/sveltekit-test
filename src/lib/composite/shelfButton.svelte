<script lang="ts">
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import {
		useGetShelfFolders,
		useUpdateShelfFolder
	} from '$lib/queries/folders/folders';
	import {
		useGetUserBookData,
		useShelf
	} from '$lib/queries/user/useUserBookData';
	import { user } from '$lib/state/runes.svelte';
	import type { bookWithUserInfo } from '$lib/types';
	import { includes, isEmpty } from 'lodash-es';
	import { Button } from '../components';
	import { DEFAULT_FOLDER, MAX_FOLDERS_SIZE } from '$lib/data/constants';
	import { useGetShelvedBooksAll } from '$lib/queries';

	let { book }: { book: bookWithUserInfo } = $props();
	console.log(user.authStatus);
	if (!book.user_book_data && user.authStatus == 'signed in') {
		console.log(book);
		throw 'missing user book data in shelf button' + JSON.stringify(book);
	}

	const up = useShelf();
	const buckets = useGetShelfFolders();
	const updateBucket = useUpdateShelfFolder();
	const op = $derived({
		bookID: book.id,
		uid: user.id,
		data: book.user_book_data?.[0]
	});
	let userInfo = useGetUserBookData(() => {
		return op;
	});
	const update = $derived(up);
	let user_data = $derived(userInfo.data);
	let is_shelved = $derived(user_data?.is_shelved == true ? true : false);
	let display = $derived(is_shelved ? '-unShelf' : '+Shelf');
	const shelved_books_tags = useGetShelvedBooksAll(() => true);
	let new_bucket = $state('');
	function updateUserBookData(folder: string | undefined = DEFAULT_FOLDER) {
		update.mutate(
			{
				book_id: book.id,
				is_shelved: !is_shelved,
				folder: folder,
				tags: [folder].filter((v) => v.length > 0)
			}
			/* 	{
				onSuccess: async () => {
					open = false;
					// now add this folder if new
					// if fail then this book will just be in default folder
					const invalid =
						isEmpty(buckets.data?.folders) ||
						!includes(buckets.data?.folders, folder);
					if (invalid && folder && !!folder) {
						console.log('add new bucket to folder');
						await updateBucket.mutateAsync(
							[...(buckets.data?.folders || [])].concat([folder])
						);
					}
				}
			} */
		);
	}
	let open = $state(false);
	let customAnchor = $state<HTMLElement>(null!);
</script>

<Button
	size="sm"
	class="truncate bg-green-900  "
	variant="default"
	disabled={user.authStatus != 'signed in'}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		if (is_shelved)
			update.mutate({
				book_id: book.id,
				is_shelved: !is_shelved,
				tags: []
				//userID: user.id
			});
		else open = !open;
	}}
	isLoading={update.isPending}
>
	{display}
</Button>

<Popover.Root bind:open>
	<Popover.Trigger></Popover.Trigger>
	<Popover.Content
		class="w-80 z-53 {is_shelved ? ' hidden' : ''}"
		interactOutsideBehavior="ignore"
	>
		<div class="grid gap-4">
			<div class="space-y-2">
				<h4 class="font-medium leading-none">Shelf to folder</h4>
				<p class="text-sm text-muted-foreground">
					{buckets.data?.folders.length}/{MAX_FOLDERS_SIZE}
				</p>
			</div>
			<div class="grid gap-2">
				<div class="grid grid-cols-5 items-center gap-4">
					<Label for="width">Add</Label>
					<Input
						id="width"
						class="col-span-2 h-8"
						bind:value={new_bucket}
						autocomplete="off"
					/>
					<Button
						variant="ghost"
						class="bg-blue-200 col-span-2"
						onclick={() => {
							updateUserBookData(new_bucket);
						}}
					>
						Shelf {new_bucket}
					</Button>
				</div>
				<!-- 	<Button
					variant="ghost"
					class="bg-blue-100"
					onclick={() => {
						updateUserBookData();
					}}
				>
					default
				</Button> -->
				{#each shelved_books_tags.data?.customUserTags || [] as item}
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
