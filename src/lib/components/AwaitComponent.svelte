<script lang="ts">
	import Spinner from '$lib/icons/loader/Spinner.svelte';
	// define a generic
	type T = $$Generic;
	export let data: T;
</script>

{#await data}
	<Spinner />
{:then products}
	<slot prop={products} />
{/await}
