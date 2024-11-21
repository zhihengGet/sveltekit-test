<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import {
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { chatStore, openState } from './store.svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import AvatarImage from '$components/ui/avatar/avatar-image.svelte';
	import Avatar from '$components/avatar.svelte';
	import {
		useGetBannedUsers,
		useGetRoommates,
		useRoomTransferOwnership,
		useUnbanUser
	} from './query';
	import { checkExpirationDates } from './util.svelte';
	import RoomForm from './RoomForm.svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import SimplePaginationUi from '$components/SimplePaginationUi.svelte';
	import { user } from '$lib/state/runes.svelte';

	type User = {
		id: string;
		name: string;
		email: string;
		isBanned: boolean;
		isModerator: boolean;
	};

	let isOpen = $state(false);
	let roomName = $state('General Chat');
	let isPublic = $state(true);
	const users = useGetRoommates(() => {
		return chatStore.selectedChat?.room_id;
	});
	const transfer = useRoomTransferOwnership();
	const mods = $derived(users.data?.filter((v) => v.role == 'moderator') || []);
	const admin = $derived(users.data?.find((v) => v.role == 'admin') || {});
	const regular_user = $derived(
		users.data?.filter((v) => v.role == 'user') ?? []
	);
	const unban = useUnbanUser();
	const muted_user: {
		[s in string]: ReturnType<typeof checkExpirationDates>;
	} = $derived.by(() => {
		return (
			users.data?.reduce((prev, curr) => {
				prev[curr.user_id] = checkExpirationDates(
					curr.mute_start_date,
					curr.mute_duration
				);
				return prev;
			}, {}) ??
			([] as unknown as {
				[s in string]: ReturnType<typeof checkExpirationDates>;
			})
		);
	});
	let room_id = $derived(chatStore.selectedChat?.room_id);
	let muted_users = $derived(
		users.data?.filter((v) => muted_user?.[v.user_id]?.isMutedNowOrLater) ?? []
	);
	let newUserEmail = $state('');
	let owner = $state<User>({
		id: '0',
		name: 'Admin',
		email: 'admin@example.com',
		isBanned: false,
		isModerator: true
	});

	function handleBanUnban(userId: string) {}

	function handlePromoteDemote(userId: string) {}

	function handleInviteUser() {}

	function handleTransferOwnership(userId: string) {
		if (room_id) transfer.mutate({ new_owner: userId, room_id: room_id });
	}
</script>

<Dialog bind:open={openState.openManager}>
	<!-- <DialogTrigger class={buttonVariants.variants.variant['outline']}>
		Manage Chat Room
	</DialogTrigger> -->
	<DialogContent class="sm:max-w-[625px]">
		<DialogHeader>
			<DialogTitle>Chat Room Settings</DialogTitle>
			<DialogDescription>
				Manage your chat room settings, users, and permissions.
			</DialogDescription>
		</DialogHeader>
		<Tabs value="general" class="w-full">
			<TabsList class="grid w-full grid-cols-6">
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="users">Users</TabsTrigger>
				<TabsTrigger value="moderators">Moderators</TabsTrigger>
				<TabsTrigger value="ownership" disabled={admin?.user_id !== user.id}>
					Ownership
				</TabsTrigger>
				<TabsTrigger value="ban">Banned</TabsTrigger>
				<TabsTrigger value="mute">Muted</TabsTrigger>
			</TabsList>
			<TabsContent value="general">
				<div class="space-y-4 py-4">
					<RoomForm room={chatStore.selectedChat} />
				</div>
			</TabsContent>
			<TabsContent value="users">
				<ScrollArea class="h-[200px] w-full rounded-md border p-4">
					{#each users.data ?? [] as user}
						<div class="flex items-center justify-between py-2">
							<button
								onclick={() => {
									chatStore.user = user;
									chatStore.openUserDialog = true;
									openState.openManager = false;
								}}
							>
								{user.name}
							</button>
							<span>{timeAgo(user.joined_at)}</span>
							<!-- <Button
								variant="outline"
								size="sm"
								onclick={() => handleBanUnban(user.id)}
							>
								ban
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleBanUnban(user.id)}
							>
								Kick
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleBanUnban(user.id)}
							>
								Mute
							</Button> -->
						</div>
					{/each}
				</ScrollArea>
				<div class="flex items-center space-x-2 mt-4">
					<Input placeholder="user@example.com" bind:value={newUserEmail} />
					<Button onclick={handleInviteUser}>Invite</Button>
				</div>
			</TabsContent>
			<TabsContent value="moderators">
				<ScrollArea class="h-[200px] w-full rounded-md border p-4">
					{#each mods as user}
						<div class="flex items-center justify-between py-2">
							<span>{user.name} ({user.role})</span>
							<Button
								variant="outline"
								size="sm"
								onclick={() => handlePromoteDemote(user.id)}
							>
								Demote
							</Button>
						</div>
					{/each}
				</ScrollArea>
			</TabsContent>
			<TabsContent value="ownership">
				<div class="space-y-4 py-4">
					<p>Current Owner: {owner.name} <!-- ({owner.email}) --></p>
					<Label>Transfer Ownership</Label>
					<ScrollArea class="h-[200px] w-full rounded-md border p-4">
						{#each users.data?.filter((a) => a?.user_id !== user.id) ?? [] as roommate}
							<div class="flex items-center justify-between py-2">
								<span>{roommate.name}<!--  ({roommate.email}) --></span>
								<Button
									variant="outline"
									size="sm"
									onclick={() => handleTransferOwnership(roommate.user_id)}
								>
									Transfer
								</Button>
							</div>
						{/each}
					</ScrollArea>
				</div>
			</TabsContent>
			<TabsContent value="ban">
				<div class="space-y-4 py-4">
					<Label>User Banned List</Label>
					<SimplePaginationUi
						count={5}
						size={5}
						useQuery={useGetBannedUsers}
						filter={{ room_id: chatStore.selectedChat?.room_id }}
						hasSize={false}
					>
						{#snippet child({ data })}
							<div class="grid grid-cols-1 gap-1 w-full">
								{#each data || [] as banned}
									<div class="grid grid-cols-3 gap-1 bg-neutral-200 p-2">
										<span class="font-light truncate">{banned.name}</span>
										<span class="font-light truncate">
											{banned.reason ?? 'No Reason'}
										</span>
										<button
											onclick={() => {
												unban.mutate({
													room_id: chatStore.selectedChat?.room_id,
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
					</SimplePaginationUi>
				</div>
			</TabsContent>
			<TabsContent value="mute">
				<ScrollArea class="h-[300px] w-full rounded-md border p-4">
					<Card class="mb-4">
						<CardContent class="flex items-center justify-between p-4">
							{#each muted_users as user}
								<div class="flex items-center space-x-4">
									<Avatar username={user.name} userId={user.user_id}></Avatar>
									<button
										onclick={() => {
											chatStore.user = user;
											chatStore.openUserDialog = true;
											openState.openManager = false;
										}}
										class="text-sm font-medium"
									>
										{user.name}
									</button>
								</div>
							{/each}
						</CardContent>
					</Card>
				</ScrollArea>
			</TabsContent>
		</Tabs>
	</DialogContent>
</Dialog>
