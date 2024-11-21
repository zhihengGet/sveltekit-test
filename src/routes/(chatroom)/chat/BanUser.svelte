<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { default as Button } from '$lib/components/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { user_chatroom_data } from '$lib/types';
	import type { Snippet } from 'svelte';
	import { chatStore, openState } from './store.svelte';
	import { useCheckMuteInfo, useMuteInfo } from './util.svelte';
	import {
		useMute,
		useUnmute,
		useBanUser,
		useQuit,
		useKickUser,
		useUpdateRole,
		useGetRoommates
	} from './query';
	import Drawer from '$components/Drawer.svelte';
	let {
		room_user,
		buttonOnly = false,
		button
	}: {
		room_user?: user_chatroom_data;
		buttonOnly?: boolean;
		button?: Snippet<[object]>;
	} = $props();

	const ban = useBanUser();

	let inputData = $state({
		duration: 1,
		reason: '',
		status: '',
		name: '',
		description: ''
	});
	function banUser() {
		if (chatStore.selectedChat && room_user)
			ban.mutate({
				room_id: chatStore.selectedChat?.room_id,
				user_id: room_user.user_id,
				reason: inputData.reason || 'Admin did not provide a reason'
			});
	}
	$effect(() => {
		if (openState.openBan) {
			chatStore.openUserDialog = false;
		}
	});
</script>

{#if buttonOnly}
	<Button
		variant="destructive"
		onclick={() => {
			chatStore.openUserDialog = false;
			openState.openBan = true;
		}}
	>
		Ban
	</Button>
{:else}
	<Drawer
		bind:open={openState.openBan}
		title="Ban [{room_user?.name}"
		description="You can remove the ban later..."
	>
		<!-- <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			{#if !button}
				Ban
			{:else}
				{#snippet child({ props })}
					{@render button?.(props)}
				{/snippet}
			{/if}
		</Dialog.Trigger> -->

		<div class="grid gap-4">
			<Label for="name" class="">Reason</Label>
			<Input id="name" class="col-span-3" bind:value={inputData.reason} />
		</div>
		<Dialog.Footer>
			<Button
				isLoading={ban.isPending}
				onclick={banUser}
				type="submit"
				variant="destructive"
			>
				Ban
			</Button>
		</Dialog.Footer>
	</Drawer>
{/if}
