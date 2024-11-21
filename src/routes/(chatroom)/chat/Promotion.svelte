<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { default as Button } from '$lib/components/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { user_chatroom_data } from '$lib/types';
	import type { Snippet } from 'svelte';
	import { chatStore, openState } from './store.svelte';
	import { usePromoteUser } from './query';
	import { Drawer } from '$components/ui/drawer';
	let {
		room_user
	}: {
		room_user?: user_chatroom_data;
	} = $props();

	let inputData = $state({
		duration: 1,
		reason: '',
		status: '',
		name: '',
		description: ''
	});
	const promote = usePromoteUser();
	$effect(() => {
		if (openState.openPromote) {
			chatStore.openUserDialog = false;
		}
	});
	let isMod = $derived(room_user?.role == 'moderator');
</script>

<Drawer bind:open={openState.openPromote}>
	<!-- <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		{#snippet child({ props })}
			{@render button?.(props)}
		{/snippet}
		{#if !button}
			{buttonText}
		{/if}
	</Dialog.Trigger> -->
	<Dialog.Content class="sm:max-w-[425px] z-51">
		<Dialog.Header>
			<Dialog.Title>Kick [room_user.name]</Dialog.Title>
			<Dialog.Description>
				Kicked user can always rejoin with matching secret
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4">
			<Label for="name" class="">Reason</Label>
			<Input id="name" class="col-span-3" bind:value={inputData.reason} />
		</div>
		<Dialog.Footer>
			<Button
				isLoading={promote.isPending}
				onclick={() => {
					promote.mutate({
						room_id: chatStore.selectedChat?.room_id,
						user_id: room_user?.user_id,
						mod: isMod ? false : true
					});
				}}
				type="submit"
			>
				{isMod ? 'Demote To User' : 'Promote to Mod'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Drawer>
