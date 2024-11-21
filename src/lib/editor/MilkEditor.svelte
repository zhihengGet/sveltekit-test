<script lang="ts">
	import { Crepe } from '@milkdown/crepe';
	import '@milkdown/crepe/theme/common/style.css';
	// We have some themes for you to choose
	// available themes: frame, classic, nord, frame-dark, classic-dark, nord-dark
	import '@milkdown/crepe/theme/frame.css';
	import { onDestroy, onMount } from 'svelte';

	const crepe = new Crepe({
		root: document.getElementById('milkdown'),
		defaultValue: 'Hello, Milkdown!'
	});
	onMount(() => {
		crepe.create().then(() => {
			console.log('Editor created');
		});
	});

	onDestroy(() => {
		// To destroy the editor
		crepe.destroy();
	});
</script>

<div id="milkdown">Loading...</div>
