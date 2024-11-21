<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { chatStore } from './store.svelte';
	let { description }: { description: string } = $props();
</script>

<Dialog.Root bind:open={chatStore.openRoomInfo}>
	<!-- 	<Dialog.Trigger class="text-lg font-bold">
		{chatStore.selectedChat?.name}
	</Dialog.Trigger> -->
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{chatStore.selectedChat?.name}</Dialog.Title>
			<Dialog.Description>
				Created at {chatStore.selectedChat?.created_at}
			</Dialog.Description>
		</Dialog.Header>
		<div class="font-400 text-md">
			{chatStore.selectedChat?.description}
		</div>
		<!-- <div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" value="Pedro Duarte" class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="username" class="text-right">Username</Label>
				<Input id="username" value="@peduarte" class="col-span-3" />
			</div>
		</div> -->
		<Dialog.DialogClose>
			<Button type="submit">Close</Button>
		</Dialog.DialogClose>
	</Dialog.Content>
</Dialog.Root>
