<script lang="ts">
	import AwaitComponent from '$components/AwaitComponent.svelte';
	import { OvalSpinner } from '$lib/icons';
	import { onMount, type ComponentType } from 'svelte';

	type T = $$Generic;
	export let loadComponent: T;

	let componentPromise: ReturnType<T>;
	onMount(() => {
		componentPromise = loadComponent();
	});
</script>

<AwaitComponent data={componentPromise} let:prop>
	<slot {prop} />
</AwaitComponent>
