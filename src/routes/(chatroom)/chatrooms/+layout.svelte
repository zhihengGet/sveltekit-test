<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	import HeaderBuilt from '$lib/composite/HeaderBuilt.svelte';

	/** @type {Props} */
	let { children } = $props();
</script>

<HeaderBuilt />
{@render children?.()}
