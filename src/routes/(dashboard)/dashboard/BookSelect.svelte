<script>
	import { useGetAllAuthoredBooks } from '$lib/queries';
	import * as Select from '$lib/components/ui/select';
	import { dashboardBookStore } from './BookStore.svelte';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import { sortBy } from 'lodash-es';
	const books = useGetAllAuthoredBooks();
</script>

<!-- markup (zero or more items) goes here -->

<Select.Root type="single">
	<Select.Trigger class="w-[180px]">
		<span class="truncate">
			{dashboardBookStore.selectedBook?.title ?? 'Select a Book'}
		</span>
	</Select.Trigger>
	<Select.Content class=" inline-block max-h-xl overflow-auto m-1">
		<Select.Group>
			<label>Authored Book List</label>
			<QueryLoaderRunes CreateQueryResult={books}>
				{#each sortBy(books.data, (v) => v.title) || [] as fruit}
					<Select.Item
						value={fruit.title}
						label={fruit.title}
						onclick={() => (dashboardBookStore.selectedBook = fruit)}
					>
						{fruit.title}
					</Select.Item>
				{/each}
			</QueryLoaderRunes>
		</Select.Group>
	</Select.Content>
	<!-- 	<input name="favoriteFruit" /> -->
</Select.Root>

<style>
	/* your styles go here */
</style>
