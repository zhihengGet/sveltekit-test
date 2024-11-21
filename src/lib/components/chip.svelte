<script lang="ts">
	//import type { ComponentType } from 'svelte';

	export let classes = '';
	export { classes as class };
	//export let text = '';
	//export let icon: ComponentType = undefined;

	let cls =
		'inline-flex w-fit h-20px justify-center items-center  px-2 py-1 rounded-[11px] bg-orange-700 text-[12px] text-white capitalize ' +
		classes;
</script>

<div class={cls}>
	<slot name="icon" />
	<slot name="text" />
	<slot />
</div>
