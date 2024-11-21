<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { Snippet } from 'svelte';
	import { chatStore } from './store.svelte';
	import { useQuit } from './query';
	let { children, text }: { children: Snippet<[object]>; text?: string } =
		$props();

	const quit = useQuit();
	function leave() {
		quit.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		{text}
		{#snippet child({ props })}
			{@render children?.(props)}
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-fit">
		<div class="grid">
			<div class="space-y-2">
				<Button onclick={() => leave()} variant="destructive">Quit</Button>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
