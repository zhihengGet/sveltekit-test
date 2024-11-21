<script lang="ts">
	import { InkStore, WordBank } from '../../store.svelte';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Button, Dialog } from '$lib/components';
	import { useGetUserEditSetting } from '$lib/queries/userSetting/getSetting';
	import { useAddKeyword } from '$lib/queries/userSetting/updateSetting';
	import { isEqual, uniqBy } from 'lodash-es';
	import Dropdown from '$components/dropdown.svelte';
	import { useGetAllAuthoredBooks } from '$lib/queries';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';

	let value = $state('');
	let words = $state('');
	const currentConfig = useGetUserEditSetting(() => {
		return { bookID: InkStore.book!.id };
	});
	const update = useAddKeyword();
	let inheritId: { bookID: string } = $state({ bookID: null });
	let inheritBookTitle: string = $state('');
	const inheretWords = useGetUserEditSetting(() => inheritId);

	$effect(() => {
		words =
			currentConfig.data?.setting.wordBank.map((v) => v.keyword)?.join('\n') ??
			'';
	});
	function del(keyword: string | undefined) {
		if (currentConfig.data && keyword)
			update.mutate({
				book_id: InkStore.book.id,
				setting: {
					wordBank: currentConfig.data.setting.wordBank.filter(
						(v) => v.keyword !== keyword
					),
					style: { backgroundColor: '', backgroundImage: '' }
				}
			});
	}

	const books = useGetAllAuthoredBooks();

	function handleSubmit(words: string[]) {
		let list = uniqBy(
			words
				.map((v) => v.trim())
				.filter((v) => v.length > 0)
				.map((v) => ({ keyword: v, definition: '' }))
				.concat(currentConfig.data?.setting.wordBank ?? []),
			(v) => v.keyword
		);
		if (!isEqual(list, currentConfig.data?.setting.wordBank))
			update.mutate({
				book_id: InkStore.book.id,
				setting: { wordBank: list }
			});
	}

	$effect(() => {
		let new_words =
			currentConfig.data?.setting.wordBank.map((v) => v.keyword) ?? [];

		Object.assign(WordBank, $state.snapshot(new_words));
	});

	import * as Accordion from '$lib/components/ui/accordion';
</script>

<Dialog
	title="Words"
	bind:open={InkStore.openAutocomplete}
	desc="Add autocomplete words:Max(200) Case Sensitive"
	class="md:w-100 md:h-1/2 overflow-auto"
>
	<div class=" flex gap-2 flex-col">
		<div>
			<!-- <Button
				class="text-sm p-1"
				variant="outline"
				onclick={() => {
					InkStore.enableAutocomplete = !InkStore.enableAutocomplete;
				}}
			>
				{InkStore.enableAutocomplete
					? 'Disable autocomplete'
					: 'Enable autocomplete'}
			</Button>
 -->
			<QueryLoaderRunes CreateQueryResult={books}>
				<Dropdown
					buttonString="inherit from other book"
					items={{
						books: [
							{
								str: 'none',
								leftIcon: null,
								onClick: () => (inheritId.bookID = -1)
							},
							...(books.data?.map((v) => {
								return {
									str: v.title,
									onClick: () => {
										inheritBookTitle = v.title;
										inheritId.bookID = v.id;
									},
									leftIcon: null
								};
							}) || [])
						]
					}}
				></Dropdown>
			</QueryLoaderRunes>
		</div>
		{#if inheritId.bookID >= 0}
			<QueryLoaderRunes CreateQueryResult={inheretWords}>
				<div>
					{#each inheretWords.data?.setting.wordBank ?? [] as item}
						<button
							class="inline-flex justify-center items-center text-sm border-1 bg-white min-w-10 px-1 h-10 rounded"
							onclick={() => del(item.keyword)}
						>
							{item.keyword}
						</button>
					{/each}
				</div>
			</QueryLoaderRunes>
		{/if}
		<hr />
		<div class="max-h-20 overflow-auto">
			{#each currentConfig.data?.setting.wordBank ?? [] as item}
				<button
					class="inline-flex justify-center items-center text-sm border-1 bg-amber min-w-10 px-1 h-10 rounded"
					onclick={() => del(item.keyword)}
				>
					{item.keyword}
				</button>
			{/each}
		</div>

		<div class="">
			<Label>Word</Label>
			<Input class="mb-2 inline-flex w-25" bind:value />
			<Button
				isLoading={update.isPending || inheretWords.isLoading}
				onclick={() => handleSubmit([value])}
			>
				+
			</Button>
		</div>
		<hr />
		<Accordion.Root class="w-full sm:max-w-[70%]" type="single">
			<Accordion.Item value="item-1">
				<Accordion.Trigger>Advanced Batch Mode</Accordion.Trigger>
				<Accordion.Content>
					<textarea
						class="block border-1 h-20 bg-amber-100 w-90% p-3"
						placeholder="enter words separated by a newline"
						aria-multiline="true"
						bind:value={words}
					></textarea>
					<Button
						variant="outline"
						onclick={() => handleSubmit(words.split('\n').map((v) => v.trim()))}
					>
						Upload All Words
					</Button>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Dialog>
