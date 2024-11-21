<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import MessageCircleOffIcon from 'lucide-svelte/icons/message-circle-off';
	import { openState, chatStore } from './store.svelte';
	import { useMuteAll } from './query';
	import Input from '$components/ui/input/input.svelte';
	import { useCheckMuteInfo, useMuteInfo } from './util.svelte';

	let { type }: { type?: 'kick' | 'ban' | 'mod' } = $props();
	let inputData = $state({ duration: 1, reason: '' });
	let is_room_muted = useMuteInfo(() => {
		return {
			mute_all: {
				start_date: chatStore.selectedChat?.mute_start_date,
				duration: chatStore.selectedChat?.mute_duration
			}
		};
	});
	let is_muted = $derived(is_room_muted().mute_info.isMutedNowOrLater);
	const mute = useMuteAll();
</script>

<AlertDialog.Root bind:open={openState.openMuteAll}>
	<AlertDialog.Trigger
		disabled={!chatStore.selectedChat?.room_id}
		class={buttonVariants({ variant: 'outline', size: 'sm' })}
	>
		<MessageCircleOffIcon size={16} />
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				Entire Room will be {is_muted ? 'unmuted' : 'muted'}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<label for="duration" class:hidden={is_muted}>Duration in minutes</label>
		{#if is_muted == false}
			<Input
				id="duration"
				placeholder="duration in minutes"
				type="number"
				bind:value={inputData.duration}
			/>
		{/if}

		<label for="duration">Reason</label>
		<Input placeholder="reason" bind:value={inputData.reason} />
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				disabled={!chatStore.selectedChat?.room_id}
				onclick={() => {
					mute.mutate({
						room_id: chatStore.selectedChat?.room_id,
						reason: inputData.reason,
						mute_duration: inputData.duration * 1000 * 60,
						mute_start_date: Date.now(),
						mute: is_muted ? false : true
					});
				}}
			>
				{is_muted ? 'unmute' : 'mute'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
