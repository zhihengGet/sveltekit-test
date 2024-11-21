<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { Snippet } from 'svelte';

	let { data }: { data: { name: string; component: Snippet }[] } = $props();
</script>

<Tabs.Root value="account" class="w-[400px]">
	<Tabs.List class="grid w-full grid-cols-2">
		{#each data as { name }}
			<Tabs.Trigger value={name}>{name}</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each data as { name, component }}
		<Tabs.Content value="{name}]">
			{@render component()}
		</Tabs.Content>
	{/each}
</Tabs.Root>
