<script lang="ts">
	import { useGetBookReadHistory, useGetShelvedBooksAll } from '$lib/queries';
	let { children } = $props();

	const books = useGetShelvedBooksAll();
	const history = useGetBookReadHistory(() => false);
</script>

{@render children({ books: books.data ?? [], history: history.data ?? [] })}
