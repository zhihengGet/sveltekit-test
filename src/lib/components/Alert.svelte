<script lang="ts">
	import { default as Terminal } from 'lucide-svelte/icons/terminal';
	import * as Alert from '$lib/components/ui/alert';
	import type { Snippet } from 'svelte';

	let {
		title,
		children,
		...props
	}: { title: string; children: Snippet; class: string; variant: string } =
		$props();
</script>

<Alert.Root {...props}>
	<Terminal class="h-4 w-4" />
	<Alert.Title class="flex flex-between">
		<h4>{title}</h4>
	</Alert.Title>
	<Alert.Description>
		{@render children()}
	</Alert.Description>
</Alert.Root>
