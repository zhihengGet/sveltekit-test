<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon'
import Sun from 'lucide-svelte/icons/sun'
import Edit2 from 'lucide-svelte/icons/edit-2'
import UserX from 'lucide-svelte/icons/user-x'
import MicOff from 'lucide-svelte/icons/mic-off'
import Truck from 'lucide-svelte/icons/truck';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Button from '$lib/components/button.svelte';
	import {
		Avatar,
		AvatarFallback,
		AvatarImage
	} from '$lib/components/ui/avatar';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { chatStore, openState, type room_user } from './store.svelte';
	import Drawer from '$components/Drawer.svelte';
	import { getPublicAvatarUrlSync } from '$lib/queries/storage/ObjectKey';
	import {
		useMute,
		useUnmute,
		useBanUser,
		useQuit,
		useKickUser,
		useUpdateRole,
		useGetRoommates,
		useUpdateUser
	} from './query';
	import { user } from '$lib/state/runes.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { statusToBackgroundColor, useCheckMuteInfo } from './util.svelte';
	import Dropdown from '$components/dropdown.svelte';
	import MuteDialog from './MuteDialog.svelte';
	import BanUser from './BanUser.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	//const isDarkMode = $state(false);
	let isEditing = $state(false);
	let room_user: room_user = $state({});
	const unmute_user = useUnmute();
	const mute = useMute();
	const kik = useKickUser();
	let showAlert = $state(false);
	const ban = useBanUser();
	const promote = useUpdateRole();
	const leave = useQuit();
	const roommates = useGetRoommates(() => chatStore.selectedChat?.room_id);
	const currRoomUser = $derived(
		roommates.data?.find((v) => v.user_id == user.id)
	);
	const mute_info = useCheckMuteInfo(() => {
		return {
			mute_params: {
				start_date: room_user.mute_start_date,
				duration: room_user.mute_duration
			}
		};
	});
	$effect(() => {
		room_user = Object.assign(room_user, chatStore.user);
	});
	let inputData = $state({
		kickDuration: 1,
		reason: '',
		status: '',
		name: room_user.name,
		description: room_user.description
	});
	$effect(() => {
		inputData.description = room_user.description;
		inputData.name = room_user.name;
		inputData.status = room_user.status;
	});
	const handleEdit = () => {
		isEditing = !isEditing;
	};
	$effect(() => {
		if (!chatStore.openUserDialog) {
			isEditing = false;
		}
	});
	let action = $state('');
	function handleRole() {
		if (room_user.role == 'user') {
			promote.mutate({
				room_id: chatStore.selectedChat?.room_id,
				user_id: room_user.user_id,
				mod: room_user.role == 'user'
			});
		} else {
			promote.mutate({
				room_id: chatStore.selectedChat?.room_id,
				user_id: room_user.user_id,
				mod: room_user.role == 'user'
			});
		}
	}
	const save = useUpdateUser();
	const handleSave = () => {
		save.mutate({
			name: inputData.name,
			description: inputData.description,
			status: inputData.status || 'online',
			room_id: chatStore.selectedChat?.room_id
		});
		// Here you would typically send the updated user data to your backend
	};
	const handleUnSave = () => {
		// Here you would typically send the updated user data to your backend
	};
	function quit() {
		if (chatStore.selectedChat)
			leave.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
	function banUser() {
		if (chatStore.selectedChat)
			ban.mutate({
				room_id: chatStore.selectedChat?.room_id,
				user_id: room_user.user_id,
				reason: inputData.reason || 'Admin did not provide a reason'
			});
	}
	const handleKick = () => {
		if (chatStore.selectedChat)
			kik.mutate({
				room_id: chatStore.selectedChat!.room_id,
				user_id: room_user.user_id,
				reason: inputData.reason || 'Admin did not provide a reason'
			});
		// Implement kick functionality
	};
	function assignMod() {}
	const handleMute = () => {
		if (mute_info().mute_info.isMutedNowOrLater) {
			unmute_user.mutate({
				room_id: chatStore.selectedChat!.room_id,
				user_id: room_user.user_id,
				reason: inputData.reason ?? 'No Reason',
				mute: false
			});
		} else
			mute.mutate({
				mute_duration: inputData.kickDuration * 1000 * 60,
				room_id: chatStore.selectedChat!.room_id,
				user_id: room_user.user_id,
				reason: inputData.reason ?? 'No Reason'
			});
		// Implement mute functionality
	};
	const status = Object.keys(statusToBackgroundColor);
	let self = $derived(room_user?.user_id == user.id);
</script>

<!-- <AlertDialog.Root>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		Ban
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account
				and remove your data from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root> -->

<Drawer
	description={room_user.description || 'Please add description'}
	title={room_user.name}
	bind:open={chatStore.openUserDialog}
>
	<div class="flex flex-col gap-4 py-4">
		<div class="flex items-center justify-between">
			<Avatar class="w-20 h-20">
				<AvatarImage src={getPublicAvatarUrlSync({ uid: room_user.user_id })} />
				<AvatarFallback>
					{room_user.name}
				</AvatarFallback>
			</Avatar>
			<div class="space-x-2" class:hidden={room_user.user_id !== user.id}>
				<Button size="sm" onclick={handleEdit} variant="secondary">
					<Edit2 class="h-4 w-4 mr-2" />
					{isEditing ? '' : 'Edit'}
				</Button>
			</div>
		</div>
		{#if mute_info().mute_info.isMutedNowOrLater}
			<p class="text-blue-800">
				You are muted from [{mute_info().mute_info.readable_start_date}] for
				{mute_info().mute_info.minutes} Minutes
			</p>
		{/if}
		{#if isEditing}
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={inputData.name} />
			</div>
			<div class="grid gap-2">
				<Label for="summary">Summary</Label>
				<Textarea id="summary" bind:value={inputData.description} />
			</div>
			<div class="grid gap-2">
				<!-- persisted -->
				<Label for="summary">Status</Label>
				<!-- <Dropdown
					buttonString="Status"
					class="max-h-100px"
					items={{
						status: status.map((v) => {
							return {
								str: v,
								onClick: () => {
									inputData.status = v;
								}
							};
						})
					}}
				></Dropdown>-->
				<Select.Root
					type="single"
					name="favoriteFruit"
					bind:value={inputData.status}
				>
					<Select.Trigger class="w-full capitalize">
						Your Status: {inputData.status}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Status</Select.GroupHeading>
							{#each status as fruit}
								<Select.Item value={fruit} label={fruit}>
									{fruit}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<Button isLoading={save.isPending} onclick={handleSave}>
				Save Changes
			</Button>
		{/if}
		{#if isEditing == false && !self && (currRoomUser?.role == 'admin' || currRoomUser?.role == 'moderator')}
			<div class="space-y-2">
				<h4 class="font-semibold">Admin/Mod Actions</h4>
				<div class="flex flex-wrap justify-start gap-2">
					<Button
						variant="secondary"
						size="sm"
						onclick={() => (openState.openPromote = true)}
					>
						Update Role To {room_user.role == 'moderator'
							? 'user'
							: 'moderator'}
					</Button>
					<MuteDialog
						buttonOnly={true}
						buttonText={mute_info().mute_info.isMutedNowOrLater
							? 'unmute'
							: 'mute'}
					/>
				</div>
			</div>
		{/if}
		{#if user.id === room_user.user_id && user.id !== chatStore.selectedChat?.owner_id}
			<div class="space-y-2">
				<h4 class="font-semibold">User Actions</h4>
				<div class="flex space-x-2">
					<Button
						disabled={!chatStore.selectedChat}
						variant="destructive"
						size="sm"
						onclick={quit}
					>
						Quit
					</Button>
				</div>
			</div>
		{/if}
	</div>
	{#snippet footer()}
		{#if isEditing == false && !self}
			<Button
				variant="outline"
				size="sm"
				onclick={() => (openState.openKick = true)}
			>
				Kick
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => (openState.openBan = true)}
			>
				Ban
			</Button>
		{/if}
		<Button
			onclick={() => {
				chatStore.openUserDialog = false;
			}}
		>
			Close
		</Button>
	{/snippet}
</Drawer>
