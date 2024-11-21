<script>
	import { onMount } from 'svelte';

	let component = '';
	let render = false;
	onMount(() => {
		render = true;
	});
</script>

{#if render}
	<slot />
{/if}
