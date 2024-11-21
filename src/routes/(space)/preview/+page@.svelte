<script>
	import Spinner from '$lib/icons/loader/Spinner.svelte';
	import { useGetLocalStorageFile } from '$lib/queries/storage/useLocalStorage';
	import { onMount } from 'svelte';

	let data = '';
	const query = useGetLocalStorageFile();
	onMount(() => {
		const html = localStorage.getItem('doc_preview') ?? 'empty';
		data = html;
	});
</script>

{#if query.isLoading}
	<!-- content here -->
	<Spinner />
{/if}
<div class="container mt-10 shadow-sm">{@html query.data}</div>

<style>
	:global(body) {
		background-color: rgb(191, 211, 195);
	}
</style>
