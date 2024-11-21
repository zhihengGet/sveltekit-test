<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
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

	let { room }: { room?: chatrooms | null } = $props();

	const rooms = useGetRoomList();
	let is_new = $derived(!room);

	let inputs = $state({
		secret: room?.secret ?? nanoid(),
		description: room?.description ?? 'Wheel of time',
		name: room?.name ?? '',
		roomsize: room?.max_user ?? 10,
		allow_join: room?.allow_join ?? true
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
				allow_join: room?.allow_join ?? true
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
			mutate.mutate({ room_id: room!.room_id, ...inputs });
		}
	}
	async function archiveRoom() {
		archive.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
	async function deleteRoom() {
		dele.mutate({ room_id: chatStore.selectedChat?.room_id });
	}
	async function inviteURL(id) {
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

<SimplePaginationUi
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
</SimplePaginationUi>
