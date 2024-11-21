<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { Snippet } from 'svelte';
	import { chatStore, editRoom } from './store.svelte';
	import { useMuteAll } from './query';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import type { chatrooms } from '$lib/types';
	let {
		button,
		room
	}: { button: Snippet<[{ props: object }]>; room: chatrooms } = $props();
	let muteDuration = $state(5);
	const mute = useMuteAll();
	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			{@render button({ props })}
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-80">
		<div class="flex flex-col">
			<div class="grid gap-2">
				<Label>Duration in minutes</Label>
				<Input type="number" bind:value={muteDuration} />
			</div>
			<Button
				class="my-2"
				variant="destructive"
				onclick={() => {
					mute.mutate({
						mute_duration: muteDuration,
						room_id: room.room_id,
						start_date: Date.now()
					});
				}}
			>
				Mute Room {room.name}
			</Button>
			<div class="space-y-2 mt-1 grid">
				<Label class=" text-sm">
					You can archive the room which essentially mutes the room(you cannot
					move it back to active). You can create more rooms after archive.
				</Label>
				<Button variant="outline">Archive</Button>
				<Button
					variant="default"
					onclick={() => {
						open = false;
						editRoom(room);
					}}
				>
					Edit
				</Button>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
