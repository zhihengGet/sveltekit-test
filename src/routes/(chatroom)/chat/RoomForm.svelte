<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import {
		GET_URL,
		MAX_USER_CHAT_ROOM,
		MAX_USER_CHAT_ROOM_SIZE,
		SITE_URL
	} from '$lib/data/constants';
	import { user } from '$lib/state/runes.svelte';
	import type { chatrooms } from '$lib/types';
	import { toastNotify } from '$lib/utils/toast';
	import {
		useCreateRoom,
		useGetRoomList,
		useRoomTransferOwnership,
		useUpdateRoom,
		useArchiveRoom,
		useDeleteRoom,
		useGetBannedUsers,
		useMuteAll,
		useUnbanUser
	} from './query';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	import { chatStore } from './store.svelte';
	import { nanoid } from 'nanoid';
	import PaginateUi from '$components/PaginateUI.svelte';
	import SimplePaginationUi from '$components/SimplePaginationUi.svelte';
	import { isAdmin } from './util.svelte';

	let {
		room,
		showButtons = true
	}: { room?: chatrooms | null; showButtons: boolean } = $props();

	const rooms = useGetRoomList();
	let is_owner = $derived(
		room?.owner_id === user.id || isAdmin(chatStore?.currRoomUser)
	);
	let is_new = $derived(!room);

	let inputs = $state({
		secret: room?.secret ?? nanoid(),
		description: room?.description ?? 'Wheel of time',
		name: room?.name ?? '',
		roomsize: room?.max_user ?? 10,
		allow_join: room?.allow_join ?? true,
		is_public_room: room?.is_public ?? false
	});
	let errors = $derived.by(() => {
		if (room?.user_count ?? 0 > inputs.roomsize) {
			return 'Cannot decrease room size!';
		}
		return '';
	});
	$effect(() => {
		if (room) {
			inputs = {
				roomsize: room.max_user ?? 10,
				secret: room.secret,
				description: room.description,
				name: room.name,
				allow_join: room?.allow_join ?? true,
				is_public_room: room.is_public ?? false
			};
		}
	});
	let new_owner = $state('');
	let bannedPage = $state(1);
	const create = useCreateRoom();
	const archive = useArchiveRoom();
	const dele = useDeleteRoom();
	const unban = useUnbanUser();
	const mute = useMuteAll();
	const mutate = useUpdateRoom();
	const transfer = useRoomTransferOwnership();
	async function handleCreateRoom() {
		if (is_new) {
			create.mutate(inputs, {
				onSuccess: (r) => {
					inviteURL(r.room_id);
					//toastNotify.info('Copied Invite Link');
				}
			});
		} else {
			mutate.mutate({
				room_id: room!.room_id,
				is_public: inputs.is_public_room,
				...inputs
			});
		}
	}
	async function archiveRoom() {
		archive.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
	async function deleteRoom() {
		dele.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
	async function inviteURL(id: string) {
		// Copy the text inside the text field
		await navigator.clipboard.writeText(
			SITE_URL +
				'chat/invite/' +
				(room?.room_id || id) +
				'?secret=' +
				inputs.secret
		);

		toastNotify.info(
			'Share Link Copied ! You can simply share it with your future group member!'
		);
	}
</script>

<Label>Room Name</Label>
<Input bind:value={inputs.name} disabled={!is_owner} />
<Label>Description</Label>
<Input bind:value={inputs.description} disabled={!is_owner} />

<Label>Room Size</Label>
<Input
	type="number"
	max={MAX_USER_CHAT_ROOM_SIZE}
	bind:value={inputs.roomsize}
	disabled={!is_owner}
/>
<Label>Room Secret(You can view this whenever)</Label>
<Input bind:value={inputs.secret} disabled={!is_owner} />
<Button
	variant="secondary"
	onclick={() => {
		navigator.clipboard.writeText(inputs.secret);
		toastNotify.info('Copied');
	}}
	disabled={!is_owner}
	size="sm"
>
	Copy Secret
</Button>
<div class="">
	<Checkbox
		disabled={!is_owner}
		onCheckedChange={() => {
			inputs.allow_join = !inputs.allow_join;
		}}
	></Checkbox>
	<Label>Lock Room {inputs.allow_join ? 'false' : 'true'}</Label>
	<br />
	<Checkbox
		checked={inputs.is_public_room}
		disabled={!!inputs.secret || !is_owner}
		onCheckedChange={() => {
			inputs.is_public_room = !inputs.is_public_room;
		}}
	></Checkbox>
	<Label>Is Room Public (Must have have empty secret)</Label>
</div>
<div class="text-red">{errors}</div>
{#if !is_owner}
	<div>
		<h3 class="font-bold mt-2">Banned User</h3>
		<!-- 	<SimplePaginationUi
					count={5}
					size={5}
					useQuery={useGetBannedUsers}
					filter={{ room_id: chatStore.selectedChat.room_id }}
					showPages={true}
				>
					{#snippet child({ data })}
						<div class="grid grid-cols-1 gap-1 w-full">
							{#each data as banned}
								<div class="grid grid-cols-3 gap-1 bg-neutral-200 p-2">
									<span class="font-light truncate">{banned.name}</span>
									<span class="font-light truncate">
										{banned.reason ?? 'No Reason'}
									</span>
									<button
										onclick={() => {
											unban.mutate({
												room_id: room.room_id,
												user_id: banned.user_id
											});
										}}
									>
										X
									</button>
								</div>
							{/each}
						</div>
					{/snippet}
				</SimplePaginationUi> -->

		<Accordion.Root type="single" class="w-full ">
			<Accordion.Item value="item-3">
				<Accordion.Trigger>Advanced</Accordion.Trigger>
				<Accordion.Content>
					<h3 class="font-bold text-red">Transfer Ownership</h3>
					<div class="text-xs my-1">
						You can only transfer to an user with can still create rooms ! This
						action is <b>irreversible</b>
						whether the request is accepted or not,
						<b>you will lose ownership !</b>
					</div>
					<div class="grid grid-cols-2 gap-1">
						<Input
							placeholder="User id of the new owner"
							bind:value={new_owner}
						/>
						<Button
							disabled={!new_owner || !room?.room_id || transfer.isPending}
							isLoading={transfer.isPending}
							onclick={() => {
								transfer.mutate({ new_owner, room_id: room?.room_id });
							}}
							size="sm"
							variant="secondary"
						>
							Transfer
						</Button>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
{/if}

{#if is_owner && showButtons}
	<Button
		variant="destructive"
		isLoading={dele.isPending}
		onclick={() => {
			deleteRoom();
		}}
	>
		Delete
	</Button>
	<Button
		variant="secondary"
		isLoading={archive.isPending}
		onclick={archiveRoom}
	>
		Archive
	</Button>
{/if}
<Button variant="default" isLoading={create.isPending} onclick={inviteURL}>
	Get Invite URL
</Button>
{#if is_owner && showButtons}
	<Button
		isLoading={create.isPending || mutate.isPending}
		disabled={errors != ''}
		onclick={handleCreateRoom}
	>
		{is_new ? 'Create' : 'Update'}
	</Button>
{/if}
