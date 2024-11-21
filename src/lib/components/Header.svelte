<script lang="ts">
	let {
		class: classes,
		el = null,
		...props
	}: {
		class?: string;
		el?: HTMLElement;
		style?: string;
	} = $props();
</script>

<nav
	class="{classes} w-full backdrop-blur-sm z-10 backdrop-filter px-4 py-2 bg-white/4 rounded align-middle shadow-t-inner shadow-gray-600"
	{...props}
>
	<slot name="left" />

	<slot name="middle" />

	<slot name="right" />
</nav>

<style>
</style>
