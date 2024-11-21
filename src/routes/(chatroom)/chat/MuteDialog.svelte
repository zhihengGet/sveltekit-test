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
	import { useMute, useUnmute } from './query';
	let {
		room_user,
		buttonOnly = false,
		button,
		buttonText: btn
	}: {
		room_user?: user_chatroom_data;
		buttonOnly?: boolean;
		button?: Snippet<[object]>;
		buttonText?: string;
	} = $props();
	const mute = useMute();
	const unmute_user = useUnmute();

	const mute_info = useCheckMuteInfo(() => {
		return {
			mute_params: {
				start_date: room_user?.mute_start_date,
				duration: room_user?.mute_duration
			}
		};
	});
	let data = $derived(mute_info().mute_info);
	let inputData = $state({
		duration: 1,
		reason: '',
		status: '',
		name: '',
		description: ''
	});
	const handleMute = () => {
		if (mute_info().mute_info.isMutedNowOrLater) {
			unmute_user.mutate(
				{
					room_id: chatStore.selectedChat!.room_id,
					user_id: room_user.user_id,
					reason: inputData.reason ?? 'No Reason',
					mute: false
				},
				{
					onSuccess: () => {
						if (chatStore.user) {
							chatStore.user.is_muted = false;
							chatStore.user.mute_start_date = new Date('1990').toISOString();
							chatStore.user.mute_duration = 0;
						}
					}
				}
			);
		} else
			mute.mutate(
				{
					mute_duration: inputData.duration * 1000 * 60,
					room_id: chatStore.selectedChat!.room_id,
					user_id: room_user.user_id,
					reason: inputData.reason ?? 'No Reason'
				},
				{
					onSuccess: () => {
						// update selected user
						// if (chatStore.user) {
						// 	chatStore.user.is_muted = false;
						// 	chatStore.user.mute_start_date = new Date('1990');
						// 	chatStore.user.duration = inputData.duration * 1000 * 60;
						// }
					}
				}
			);
		// Implement mute functionality
	};
	let buttonText = $derived(
		btn ?? (data.isMutedNowOrLater ? 'Unmute' : 'Mute')
	);
</script>

{#if buttonOnly}
	{@render button?.({
		onclick: () => {
			openState.openMute = true;
		}
	})}
	{#if !button}
		<Button
			variant="secondary"
			class="capitalize"
			onclick={() => {
				chatStore.openUserDialog = false;
				openState.openMute = true;
			}}
		>
			{buttonText}
		</Button>
	{/if}
{:else}
	<Dialog.Root bind:open={openState.openMute}>
		<!-- <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			{#if !button}
				{buttonText}
			{:else}
				{#snippet child({ props })}
					{@render button?.(props)}
				{/snippet}
			{/if}
		</Dialog.Trigger> -->
		<Dialog.Content class="sm:max-w-[425px] z-51">
			<Dialog.Header>
				<Dialog.Title>Edit Mute State</Dialog.Title>
				<Dialog.Description>
					{data.muted_summary}
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4">
				{buttonText}
				{#if !data.isMutedNowOrLater}
					<Label for="name" class="">Duration</Label>
					<Input
						id="name"
						type="number"
						class="col-span-3"
						bind:value={inputData.duration}
					/>
				{/if}
				<Label for="name" class="">Reason</Label>
				<Input id="name" class="col-span-3" bind:value={inputData.reason} />
			</div>
			<Dialog.Footer>
				<Button
					isLoading={mute.isPending || unmute_user.isPending}
					onclick={handleMute}
					type="submit"
				>
					{buttonText}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
