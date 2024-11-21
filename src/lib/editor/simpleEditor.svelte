<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import EditorLazy from './EditorLazy.svelte';
	let { ...props } = $props<ComponentProps<EditorLazy>>();
</script>

<EditorLazy dev={false} {...props} />
