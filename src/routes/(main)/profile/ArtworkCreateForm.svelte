<script lang="ts">
	import FileUpload from '$components/FileUpload.svelte';
	import Button from '$components/button.svelte';
	import { Input } from '$components/ui/input';
	import { Textarea } from '$components/ui/textarea';
	import BookSelect from '$lib/composite/BookSelect.svelte';
	import { useSearchBooks } from '$lib/queries/book/getBooks';
	import { useCreateArtwork } from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import { supabase } from '$lib/supabaseClient/client';
	import type { book, min_chapter } from '$lib/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { debounce } from 'lodash-es';
	import { profileStore } from './profileStore.svelte';
	import Label from '$components/ui/label/label.svelte';
	let {
		selectedBook = null,
		showBookSelector,
		//select = $bindable(),
		selectedChapter = $bindable()
	}: {
		selectedBook?: book | null;
		selectedChapter?: min_chapter;
		showBookSelector?: boolean;
	} = $props();
	let s = $state({ searchText: '' });
	const search = useSearchBooks(() => s);
	let ss: { book: book | null } = $state({ book: selectedBook });
	let book: book | null = $derived(ss.book);
	let image: File[] = $state([]);
	const create = useCreateArtwork();
	const deb = debounce((v: string) => {
		s.searchText = v;
	}, 300);
	const data = createQuery({
		queryFn: async () => {
			const data = await supabase
				.from('artworks')
				.select('*', { head: true, count: 'exact' })
				.eq('user_id', user.id);
			return data.count;
		},
		queryKey: ['artworks', 'count', 'self']
	});
	function handle() {
		if (image.length > 0 && book && image[0])
			create.mutate({
				//	type: 'artwork',
				file: image[0],
				book_id: book.id,
				chapter_id: selectedChapter ? selectedChapter.id : null,
				name: profileStore.imageName,
				description: profileStore.description,
				ai: profileStore.ai
			});
	}
</script>

<h1 class="text-blue font-600">Max {data.data ?? 0}/200</h1>

<BookSelect
	bind:selectedBook={ss.book}
	bind:selectedChapter
	filter={{}}
	{showBookSelector}
/>

<Label for="artwork">Friendly Name</Label>
<Input
	maxlength={100}
	id="artwork"
	minlength={1}
	bind:value={profileStore.imageName}
/>
<Label for="description">Description</Label>
<Textarea
	maxlength={1000}
	id="description"
	minlength={1}
	bind:value={profileStore.description}
/>
<span class="flex mt-2">
	<Label for="ai_" class="mr-2">Is Ai generated?</Label>

	<input
		id="ai_"
		placeholder="is ai generated?"
		class="inline align-middle"
		type="checkbox"
		bind:checked={profileStore.ai}
	/>
</span>
<FileUpload
	bind:fileArray={image}
	multiple={false}
	displayPreview={true}
	uploadUI={false}
/>
<Button
	onclick={handle}
	isLoading={create.isPending}
	disabled={!ss.book || image.length == 0 || !profileStore.imageName}
>
	Submit {image.length} Pic
</Button>
