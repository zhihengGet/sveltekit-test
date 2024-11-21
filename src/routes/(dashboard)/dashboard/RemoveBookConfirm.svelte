<script lang="ts">
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { useUpdateBook } from '$lib/queries';
	import {
		renameBookTitle,
		useToggleHidenBook
	} from '$lib/queries/book/deleteBook';
	import type { book } from '$lib/types';

	let { open = $bindable(false), book }: { open: boolean; book: book } =
		$props<{ open: boolean; book: book }>();
	let value = $state('');
	const id = $state({ id: book?.id });
	$effect(() => {
		if (book) id.id = book.id;
	});

	//const toggle = useToggleHidenBook();
	const update = useUpdateBook();

	function toggleBook() {
		if (book.is_visible !== false)
			update.mutate({
				old: book,
				new_book: { title: value, is_visible: false }
			});
		else {
			update.mutate({
				old: book,
				new_book: { title: value, is_visible: true }
			});
		}
		open = false;
	}
	// new deleted title
	const retype = $derived(book?.title);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{book?.title}</AlertDialog.Title>
			<AlertDialog.Description class="flex flex-col gap-2">
				<div
					class:hidden={book?.is_visible == false}
					class="grid gap-1 text-black"
				>
					<p>
						You can use this option to hide you book if you want to self-publish
						it on kdp(or others). Even people with preview urls cannot read your
						books ! By default, book disallow shelved users(early uers) to keep
						reading it , you can change this in book configs.
					</p>
					<!-- <p>
						You have <b class="text-blue">{count_premium.data}</b>
						premium chapters
					</p> -->

					<p class="line-height-4 my-2 hidden">
						The book must not include any premium chapters.
					</p>
				</div>
				<input
					class="border-1 h-9 px-1"
					bind:value
					placeholder="Please enter your book title to submit"
				/>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

			<AlertDialog.Action
				disabled={update.isPending ||
					(book.is_visible == true && value != retype)}
				onclick={toggleBook}
			>
				{value === retype || book.is_visible == false
					? 'Hide'
					: 'Please complete the blank field'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
