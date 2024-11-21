<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { Button } from './ui/button';
	import { Spinner } from '../icons';
	type Props = ComponentProps<typeof Button> & {
		isLoading?: boolean;
		disabled?: boolean;
		children?: Snippet;
		this?: HTMLButtonElement;
	};
	let { isLoading, ...prop }: Props = $props();
</script>

<Button {...prop} disabled={isLoading || prop.disabled}>
	{@render prop?.children?.()}
	{#if isLoading}
		<!-- content here -->
		<Spinner />
	{/if}
</Button>
