<script lang="ts">
	import ChatBubble from './ChatBubble.svelte';

	import Avatar from '$components/avatar.svelte';
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import HeaderBuilt from '$lib/composite/HeaderBuilt.svelte';
	import { flushSync, onDestroy, onMount, tick, untrack } from 'svelte';
	import { user } from '$lib/state/runes.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Forward from 'lucide-svelte/icons/forward';
	import Send from 'lucide-svelte/icons/send';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Smile from 'lucide-svelte/icons/smile';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import * as Card from '$lib/components/ui/card/index';
	import { Label } from '$lib/components/ui/label/index';
	/* 	import data from '@emoji-mart/data';
	import { Picker } from 'emoji-mart'; */
	import Popover from '$components/Popover.svelte';
	import { CHATROOM, MAX_USER_CHAT_MESSAGE_LENGTH } from '$lib/data/constants';
	import Toggle from '$components/ui/toggle/toggle.svelte';
	import { dev } from '$app/environment';
	import type { IncomingMessages, room_user } from './store.svelte';
	import CreateRoom from './CreateRoom.svelte';
	import {
		openState,
		chatStore,
		createRoom,
		editRoom,
		selectChat,
		refStates,
		resetRefMessage,
		writerStore
	} from './store.svelte';
	import {
		isUserMessage,
		queryKey,
		useGetRoomList,
		useGetRoommates,
		useHideAnnouncement,
		useShouldShowAnnouncement
	} from './query';
	import RoomPopover from './RoomPopover.svelte';
	import RoomPopoverOwner from './RoomPopoverOwner.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import { toHTML, emojis, connectionCache } from './render';
	import UserModal from './UserModal.svelte';
	import { parse, stringify } from 'devalue';
	import { timeAgo } from '$lib/utils/timeAgo';
	import Text from '$components/text.svelte';
	import './markdown.css';
	import { message } from 'sveltekit-superforms';
	import Alert from '$components/Alert.svelte';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import Satellite from 'lucide-svelte/icons/satellite';
	import ChartColumnDecreasing from 'lucide-svelte/icons/chart-column-decreasing';
	import LogIn from 'lucide-svelte/icons/log-in';
	import LogOut from 'lucide-svelte/icons/log-out';
	import UserMinus from 'lucide-svelte/icons/user-minus';
	import Users from 'lucide-svelte/icons/users';
	import Link from 'lucide-svelte/icons/link';
	import SpellCheck from 'lucide-svelte/icons/spell-check';
	import Info from 'lucide-svelte/icons/info';
	import X from 'lucide-svelte/icons/x';
	import Bell from 'lucide-svelte/icons/bell';
	import MessageCircleOff from 'lucide-svelte/icons/message-circle-off';
	import { fade, fly, slide } from 'svelte/transition';
	import { spring, tweened } from 'svelte/motion';
	import type { Websocket } from 'cloudflare/resources/zones/settings.mjs';
	import { SvelteMap } from 'svelte/reactivity';
	import { VirtualList } from 'svelte-virtuallists';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import Mailbox from 'lucide-svelte/icons/mailbox';
	import VolumeOff from 'lucide-svelte/icons/volume-off';
	import Trash from 'lucide-svelte/icons/trash';
	import { debounce } from 'lodash-es';
	import RoomInfo from './RoomInfo.svelte';
	import RoomStats from './RoomStats.svelte';
	import {
		PortalBottom,
		createMutationObserver,
		useScrollListener
	} from './mutationObserver.svelte';
	import Announcement from './Announcement.svelte';

	import CreateAnnouncement from './ManageAnnouncement.svelte';
	import { sleep } from '$lib/utils/sleep';
	import Dots from './Dots.svelte';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { add, isBefore } from 'date-fns';
	import {
		autoVivify,
		checkExpirationDates,
		mergeUser,
		removeUser,
		statusToBackgroundColor,
		useCheckMuteInfo,
		useTyping,
		useMuteInfo,
		useUserSyncWS,
		notifyUser,
		isModOrAdmin
	} from './util.svelte';
	import UserCard from './UserCard.svelte';
	import AlertMuteAll from './AlertMuteAll.svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import queryClient from '$lib/queries/client';
	import ScrollArea from '$components/ui/scroll-area/scroll-area.svelte';
	import UserActivities from './UserActivities.svelte';
	import UserInbox from './UserInbox.svelte';
	import { PUBLIC_CHAT_URL } from '$env/static/public';
	const status: { [s in string]: room_user['status'] } = $state({});

	let connections = connectionCache; /* keep connection */
	let connectionStatus: {
		[s in string]: 'online' | 'disconnected' | 'error' | 'connecting';
	} = $state({});
	let statusToColor = {
		online: 'green',
		disconncted: 'gray',
		error: 'red',
		connecting: 'yellow'
	};
	// console.log(emojis.map((v) => v.charCodeAt(0)));
	let rejoined = false;
	let currentWebSocket: WebSocket | null = $state();
	let startTime = Date.now();
	let announcement: IncomingMessages['announce'] | undefined = $state();
	type Keys = keyof IncomingMessages;
	type Values = IncomingMessages[Keys]; //  "myValue1" | "myValue2"
	let room_msg: IncomingMessages[] = $state([]);
	let currentRoomInfo: room_info | undefined = $state();
	/* keep a room's message */
	let message_cache: { [s in string]: IncomingMessages[] } = {};
	let announcement_cache: { [s in string]: IncomingMessages['announce'] } = {};
	let mute_room_cache: { [s in string]: IncomingMessages['mute_all'] } = {};
	let user_temp_status_cache: { [s in string]: typeof user_temp_status } =
		autoVivify();
	let user_temp_status: { [s in string]: string } = $state({});
	let mute_user_cache: { [s in string]: IncomingMessages['mute'] } =
		autoVivify();
	let room_info_cache: { [s in string]: IncomingMessages['room'] } = {};
	let message_history = $state([]);
	let isLoadingData = $state(false);
	let mute = $state({ start_date: 0, duration: 0 });
	let mute_all = $state({ start_date: 0, duration: 0 });
	let ban: IncomingMessages['ban'][] = $state([]);
	let kicked = $state();
	const roommates = useGetRoommates(() => chatStore.selectedChat?.room_id);
	let shouldScroll = $state(true);
	let chatFeed: HTMLElement | undefined = $state();
	let lastScrollTop = 0;
	let userTyping: { [s in string]: string | boolean } = $state({});
	let userTypingDisplayText = $derived(
		Object.keys(userTyping)
			.filter((v) => userTyping[v])
			.map((v) => roommates.data?.find((a) => a.user_id === v)?.name)
	);
	let typingText = $derived(
		userTypingDisplayText.length > 1
			? userTypingDisplayText.join(',') + ' are typing...'
			: userTypingDisplayText.length == 1
				? userTypingDisplayText.join(',') + ' is typing...'
				: ''
	);
	let currRoomUser = $derived(
		roommates.data?.find((v) => v.user_id == user.id)
	);
	let isMessageLoading = $derived(roommates.isLoading);
	$effect(() => {
		if (currRoomUser) {
			chatStore.currRoomUser = currRoomUser;
		}
	});
	//handle room switch
	$effect(() => {
		//handle room switch
		if (chatStore.selectedChat?.room_id) {
			untrack(() => {
				let room_id = chatStore.selectedChat.room_id;
				//TODO in development, we need to include cookie in the url
				if (chatStore.selectedChat) {
					isLoadingData = true;
					console.log(message_cache, chatStore.selectedChat.room_id);
					currentRoomInfo = room_info_cache[chatStore.selectedChat.room_id];
					chatStore.wsRoomInfo = currentRoomInfo;
					user_temp_status = user_temp_status_cache[room_id] || {};
					shouldScroll = true; //TODO check if user click room previously
					room_msg = message_cache[chatStore.selectedChat?.room_id] ?? [];
					userTyping = {};
					connect(chatStore.selectedChat?.room_id);
					console.log('cleared due to room switcher');
				}
				//	toBottom(true);
			});
		}
		//return currentWebSocket?.close(); keep connection open for best ux
	});
	let is_user_muted = useMuteInfo(() => {
		return {
			current_user: {
				start_date: currRoomUser?.mute_start_date,
				duration: currRoomUser?.mute_duration
			}
		};
	});
	let is_room_muted = useMuteInfo(() => {
		return {
			mute_all: {
				start_date: chatStore.selectedChat?.mute_start_date,
				duration: chatStore.selectedChat?.mute_duration
			}
		};
	});

	let isChatConnected = $derived(
		(chatStore.selectedChat?.room_id &&
			connectionStatus[chatStore.selectedChat?.room_id] === 'online' &&
			!is_room_muted().is_muted) ||
			is_user_muted().is_muted
	);
	$effect(() => {
		chatStore.is_room_readonly = isChatConnected;
	});
	const hideAnnouncement = useHideAnnouncement();
	const visibilityAnnouncement = useShouldShowAnnouncement(() => {
		return { announcement: announcement };
	});

	//let debounced = debounce(() => toBottom(), 200);
	const isNearBottom = () => {
		if (!chatFeed) return false;

		const threshold = 150; // pixels from bottom
		console.log(
			'near ',
			shouldScroll,
			chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight
		);
		return (
			chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight <
			threshold
		);
	};
	const toBottom = () => {};
	let user_status_ws = $state([]);
	function clearCache(room_id: string) {
		console.log('clearing cache for room', connectionStatus[room_id], room_id);
		chatStore.selectedChat = null;
		chatStore.user = null;
		queryClient.removeQueries({ queryKey: queryKey.getUsers(room_id) });
		message_cache[room_id] = [];
		delete mute_room_cache[room_id];
		delete mute_user_cache[room_id];
		delete room_info_cache[room_id];
		userTyping = {};
	}
	function clearConnection() {
		connectionCache.clear();
		abort.abort();
		connectionStatus = {};
	}
	function clearAllCache() {
		chatStore.selectedChat = null;
		chatStore.user = null;
		queryClient.invalidateQueries();
		message_cache = {};
		mute_room_cache = {};
		room_info_cache = {};
		userTyping = {};
		clearConnection();
	}

	/**
	 * @description local update state for current selected chat
	 */
	function subscribe(message: IncomingMessages, roomid: string) {
		if (message.announce) {
			// new announcement
			announcement = message.announce;
			return;
		}
		if (message.mute) {
			mergeUser(roommates.data || [], [
				{
					user_id: message.mute.user_id,
					mute_duration: message.mute.duration,
					mute_start_date: new Date(message.mute.start_date).toISOString()
				}
			]);
		}
		// update room list query results ?
		if (message.mute_all) {
			// save to cache
			// mute_all.start_date = message.mute_all.start_date;
			// mute_all.duration = message.mute_all.duration;
			if (chatStore.selectedChat) {
				chatStore.selectedChat.mute_duration = message.mute_all.duration;
				chatStore.selectedChat.mute_start_date = new Date(
					message.mute.start_date
				).toISOString();
			}
		}
		if (message.ban) {
			// remove user
			if (message.ban.user_id == user.id) {
				// myself got banned :(
				queryClient.invalidateQueries({ queryKey: queryKey.getRoomList() });
				clearCache(roomid);
			} else {
				removeUser(roommates.data, message.ban);
			}
		}

		// update user stats
		if (message.metadata) {
			if (message.metadata.type == 'user_list' && message.metadata.users) {
				mergeUser(roommates.data || [], message.metadata.users);
			}
			return;
		}
		// if (message.metadata) {
		// 	if (message.metadata.type == 'user_list' && message.metadata.users) {
		// 		mergeUser(roommates.data || [], message.metadata.users);
		// 	}
		// }
		if (message.status) {
			for (let x of message.status.users) {
				if (x.status == 'typing') {
					userTyping[x.user_id] = x.status;
				} else {
					user_temp_status[x.user_id] = x.status;
					userTyping[x.user_id] = null;
				}
			}
			return;
		}
		if (message.kick) {
			if (roommates.data) {
				let i = roommates.data.findIndex(
					(v) => v.user_id === message.kick?.user_id
				);
				if (i > -1) roommates.data.splice(i, 1);
			}
		}
		if (message.room) {
			currentRoomInfo = message.room;
			chatStore.wsRoomInfo = message.room;
			return;
		}
		if (message.message) {
			if (message.message.reply_id) {
				notifyUser(message.message);
			}
		}
		room_msg.push(message);
		if (room_msg.length > 2000) {
			// only keep latest 5000 to avoid bloat
			room_msg.splice(0, 1);
		}
		//console.log('inserted', message.message);
		//toBottom();
	}
	// abort all listener after leaving the page
	const abort = new AbortController();
	$inspect(room_msg);
	const query = useQueryClient();
	// subscriber for all room
	function keeperStore(message: IncomingMessages, roomid: string) {
		if (!message_cache[roomid]) {
			message_cache[roomid] = [];
		}
		if (message.mute) {
			//TODO instead of refetch, update optimistically
			if (roomid !== chatStore.selectedChat?.room_id) {
				query.invalidateQueries({ queryKey: queryKey.getUsers(roomid) });
			}
			mute_user_cache[roomid][message.mute.user_id] = message.mute;
		}
		if (message.kick) {
			//TODO instead of refetch, update optimistically
			if (roomid !== chatStore.selectedChat?.room_id) {
				query.invalidateQueries({ queryKey: queryKey.getUsers(roomid) });
			}
			mute_user_cache[roomid][message.kick.user_id] = message.mute;
		}
		if (message.mute_all) {
			//TODO instead of refetch, update optimistically
			if (roomid !== chatStore.selectedChat?.room_id) {
				query.invalidateQueries({ queryKey: queryKey.getRoomList() });
			}
		}
		if (message.announce) {
			announcement_cache[roomid] = message.announce;
			return;
		}
		if (message.status) {
			user_temp_status_cache[roomid][message.status.user_id] =
				message.status.status;
			return;
		}
		if (message.metadata) {
			if (roomid !== chatStore.selectedChat?.room_id) {
				query.invalidateQueries({ queryKey: queryKey.getUsers(roomid) });
			}
			return;
		}
		if (message.room) {
			room_info_cache[roomid] = message.room;
			return;
		}
		// save all other messages that need to displayed in chat area
		message_cache[roomid].push(message);
	}
	//$inspect(chatStore);
	function connect(
		room: undefined | string = chatStore?.selectedChat?.room_id
	) {
		if (!room) return;
		const proto = dev ? 'ws' : 'wss';
		let cached = connections.get(room);
		if (cached) {
			currentWebSocket = cached;
			connectionStatus[room] = currentWebSocket?.OPEN
				? 'online'
				: currentWebSocket?.CLOSED
					? 'disconnected'
					: currentWebSocket?.CONNECTING
						? 'connecting'
						: 'disconnected';
			// don't create another listener
			console.log('connection exists for room ', currentWebSocket, room);
			if (currentWebSocket?.OPEN || currentWebSocket.CONNECTING) return false;
		}
		console.log('connecting...', room);
		// first time connecting or lost connection
		clearCache(room);
		const ws = connections.get(room) || new WebSocket(PUBLIC_CHAT_URL + room);
		connectionStatus[room] = 'connecting';
		currentWebSocket = ws;
		connections.set(room, ws);
		ws.addEventListener(
			'open',
			(event) => {
				connectionStatus[room] = 'online';
				// Send user info message.
				ws.send(stringify({ client_ready: true }));
			},
			{ signal: abort.signal }
		);
		ws.addEventListener(
			'message',
			(event) => {
				let data = parse(event.data);
				console.log(
					'receive message ',
					room,
					chatStore.selectedChat?.room_id,
					data,
					ws == connections.get(chatStore.selectedChat?.room_id)
				);
				if (
					chatStore.selectedChat &&
					ws == connections.get(chatStore.selectedChat?.room_id)
				) {
					console.log('subscribing message', room_msg.length);
					subscribe(data, room);
				}
				keeperStore(data, room);
			},
			{ signal: abort.signal }
		);
		ws.addEventListener(
			'close',
			(event) => {
				room_msg.push({
					system: { type: 'system', body: 'connection closed' }
				});
				connections.delete(room);
				connectionStatus[room] = 'disconnected';
				console.log(
					'WebSocket closed, reconnecting:',
					room,
					event.code,
					event.reason
				);
				rejoin();
			},
			{ signal: abort.signal }
		);
		ws.addEventListener(
			'error',
			(event) => {
				room_msg.push({
					system: { type: 'system', body: 'connection error' }
				});
				connections.delete(room);
				connectionStatus[room] = 'error';
				console.log('WebSocket error, reconnecting:', room, event);
				rejoin();
			},
			{ signal: abort.signal }
		);
		return ws;
	}
	let rejoin = async () => {
		if (!rejoined) {
			rejoined = true;
			currentWebSocket = null;
			// Don't try to reconnect too rapidly.
			let timeSinceLastJoin = Date.now() - startTime;
			if (timeSinceLastJoin < 10000) {
				// Less than 10 seconds elapsed since last join. Pause a bit.
				await sleep(10000 - timeSinceLastJoin);
			}
			// OK, reconnect now!
			connect();
		}
	};
	onDestroy(() => {
		for (let x of connections.values()) {
			console.warn('destroying all ws connections');
			x.close();
		}
		clearConnection();
	});

	$effect(() => {
		// message added but before it is rendered
		// check if near bottom
		if (room_msg?.at(-1) && chatFeed) {
			shouldScroll =
				chatFeed.scrollHeight - chatFeed.offsetHeight - chatFeed.scrollTop <
				100;
		}
		// console.log(
		// 	'before new ui',
		// 	chatFeed.scrollHeight - chatFeed.offsetHeight,
		// 	chatFeed.scrollTop
		// );
	});
	//let chatMessage = $derived(writerStore.content);
	let isPreview = $state(false);
	let html = $state('');
	const typing = useTyping((data) => {
		if (currRoomUser && currentWebSocket) {
			console.log('ty', data);
			const m: IncomingMessages = {
				status: {
					user_id: user.id,
					status: data ? 'typing' : 'online',
					users: [
						{
							user_id: currRoomUser?.user_id,
							status: data ? 'typing' : 'online'
						}
					]
				}
			};
			currentWebSocket?.send(stringify(m));
			userTyping[user.id] = data;
		} else {
			console.error('cant send typing status', currRoomUser, currentWebSocket);
		}
	});
	/* preview html */
	$effect(() => {
		if (isPreview) {
			{
				toHTML(writerStore.content).then((v) => {
					html = v.toString();
				});
			}
		}
	});
	const scroll = useScrollListener(() => chatFeed);
	createMutationObserver(() => ({
		targetNode: chatFeed,
		action: (el) => {
			// what do we do if new message is rendered

			// we only scroll to bottom if first time visit the chat
			// before new item is rendered and user already near bottom
			// after new item is rendered and user user already near end, we scroll again just to be safe
			// if any user scroll, then not firstTime
			if (!scroll().hasScrolledUp || /* isNearBottom() || */ shouldScroll)
				el.scroll({
					top: el.scrollHeight - el.offsetHeight,
					behavior: 'smooth'
				});
		}
	}));
	const rooms = useGetRoomList();
	$effect(() => {
		// auto select first room
		if (!chatStore.selectedChat) {
			chatStore.selectedChat = rooms.data?.own?.[0] || rooms.data?.join?.[0];
		}
	});
	async function sendMessage(arg: { body: string; title: string }) {
		toHTML(arg.body).then((v) => {
			const message: IncomingMessages = {
				message: {
					type: 'user_message',
					body: v.toString(),
					title: arg.title,
					user_id: user.id,
					event_ref: '',
					ref_id: refStates.ref_message?.id,
					parent_content: refStates.ref_message?.body,
					reply_id: refStates.ref_message?.user_id
				}
			};
			currentWebSocket?.send(stringify(message));
			resetRefMessage();
		});
	}
	function updateUserStatus(arg: {
		name: string;
		description: string;
		user_id?: string;
		status: room_user['status'];
	}) {
		arg.user_id = user.id;
		const message: IncomingMessages = {
			status: {
				status: arg.status,
				type: 'status',
				users: [{ user_id: arg.user_id, status: arg.status }]
			}
		};
		currentWebSocket?.send(stringify(message));
	}
	function insertEmo(s: string) {
		writerStore.content += s;
	}
	let getUserEventIcon = (type: Values) => {
		if (!type) return;
		if ('type' in type) {
			if (type.type == 'ban') {
				return { Icon: UserMinus, bgColor: '#FFB26F' };
			}
			if (type.type == 'delete') {
				return { Icon: Trash, bgColor: 'yellow' };
			}
			if (type.type == 'mute') {
				return { Icon: VolumeOff, bgColor: 'gray' };
			}
			if (type.type == 'announcement') {
				return { Icon: Mailbox, bgColor: 'orange' };
			}
			if (type.type == 'error') {
				return { Icon: SpellCheck, bgColor: 'orange' };
			}
			return { Icon: Info };
		}
	};

	let dialogStats = $state({ announcement: false });
	$effect(() => {
		/// sync selected user when user list update
		// i.e. after we mute/ban
		// should not wait for ws or wait ?
		// or do both ?
		if (roommates.data) {
			untrack(() => {
				if (chatStore.user) {
					for (const x of roommates.data) {
						if (x.user_id == chatStore.user?.user_id) {
							chatStore.user = x;
						}
					}
				}
			});
		}
	});
</script>

{#snippet title({ text }: { text: string })}
	<h1
		class="text-center text-lg font-semibold mb-4 h-fit px-4 border-b-1 border-amber"
	>
		{text}
	</h1>
{/snippet}

<UserModal></UserModal>
<CreateRoom room={chatStore.roomToEdit} />
<HeaderBuilt />
<RoomInfo />
<RoomStats />
<CreateAnnouncement
	bind:open={dialogStats.announcement}
	webSocket={currentWebSocket}
	data={announcement}
/>

<div class="">
	<main
		class="grid grid-cols-[1.5fr_1.2fr_5fr_2fr] max-h-full items-stretch h-94vh overflow-hidden"
	>
		<section class=" bg-blue-50 border-1 flex flex-col items-center space-y-2">
			<span class="w-full flex justify-between">
				<span class="">{@render title({ text: 'Chats' })}</span>
				<UserInbox />
			</span>
			<Button
				size="sm"
				variant="outline"
				disabled={rooms.data?.own?.length >=
					CHATROOM.MAX_NUMBER_OF_CREATED_ROOM}
				onclick={() => {
					createRoom();
				}}
			>
				Create +
			</Button>
			<h3 class="font-bold text-sm w-full px-2">
				Created Room {rooms.data?.own.length}
			</h3>
			<ScrollArea class="h- w-full  rounded-md border">
				{#each rooms.data?.own ?? [] as chat}
					<span class="block w-sm w-9/10 justify-center m-2">
						<p class="flex justify-between w-full items-center relative">
							<button
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									selectChat(chat);
								}}
								class="truncate w-4/5"
							>
								# {chat.name}
							</button>
							<!-- <button
								onclick={() => {
									editRoom(chat);
								}}
								class="w-1/3"
							>
								<EllipsisVertical size="15" class="inline-block w-1/3 " />
							</button> -->
							<span
								class="absolute top-[-1em] right-0 text-xs font-bold text-amber-600"
							>
								{chat.is_public ? 'Public' : ''}
							</span>
						</p>
					</span>
				{/each}
			</ScrollArea>
			<hr class="my-2 text-red h-2" />
			<h3 class="font-bold text-sm w-full px-2">
				Joined Rooms {rooms.data?.join.length}
			</h3>
			<!-- <Button
				size="sm"
				variant="outline"
				disabled={rooms.data?.length >= CHATROOM.MAX_NUMBER_OF_CREATED_ROOM}
				onclick={() => {
					createRoom();
				}}
			>
				Join +
			</Button> -->
			<ScrollArea class="h-100 rounded-md w-full border px-2 ">
				{#each rooms.data?.join ?? [] as chat}
					<RoomPopover>
						{#snippet children(builder)}
							<span
								class="w-9/10 flex bg-blue-100 relative justify-start my-1 p-2"
							>
								<button class="w-9/10" onclick={() => selectChat(chat)}>
									<span class="truncate">
										#{chat.is_public ? 'P' : ''}
										{chat.name}
									</span>
								</button>
								<button class="w-fit" {...builder}>
									<EllipsisVertical size="15" class="inline-block" />
								</button>
								<!-- <span
									class="absolute top-[1/2] right-1/2 text-xs font-light text-amber-600"
								>
									{chat.is_public ? 'Public' : ''}
								</span> -->
							</span>
						{/snippet}
					</RoomPopover>
				{/each}
			</ScrollArea>
		</section>
		<section
			class="max-h-full bg-background border-1 flex flex-col items-center"
		>
			{@render title({ text: 'Users' })}
			<QueryLoaderRunes CreateQueryResult={roommates} />
			{#each roommates.data || [] as data (data.user_id)}
				<button
					onclick={() => {
						chatStore.user = data;
						chatStore.openUserDialog = true;
					}}
					class="w-full"
				>
					<UserCard
						{data}
						is_muted={false}
						wsStatus={user_temp_status[data.user_id]}
					/>
					<!-- <Avatar username={data.name} userId={data.user_id} class="" />
					<div class="grow-1 text-center shrink-0 text-sm w-5em pl-1">
						<p class="truncate">{data.name}</p>
						<p class="flex items-center justify-around">
							<Badge
								variant="secondary"
								style="background:{statusToBackgroundColor[data.status]}"
							>
								<span class="text-blue-200">
									{is_muted ? 'muted' : data.status}
								</span>
							</Badge>
						</p>
					</div> -->
				</button>
			{/each}
		</section>
		<section
			id="realtime-chat"
			class=" bg-white border-b-1 border-amber flex flex-col justify-between overflow-auto relative h-full"
		>
			<div class="w-full min-h-50px bg-white pl-5 shadow sticky top-0 z-1 px-2">
				<div class="flex items-center 1 justify-between">
					<button onclick={() => (chatStore.openRoomInfo = true)}>
						<h1 class="text-xl font-bold capitalize text-effect">
							{chatStore.selectedChat?.name}
						</h1>
					</button>
					<button
						onclick={() => {
							openState.openResource = true;
						}}
						class="text-md"
					>
						💡 Resources
					</button>
					<!-- 	<button class="text-md font-light">
						Statistics <ChartColumnDecreasing class="inline" size={12} />
					</button> -->
					<!-- <h1 class="text-sm font-light">History</h1> -->
					<!-- 	<h1 class="" onclick={() => {}}><Bell size={15} /></h1> -->

					<span class="text-sm font-semibold flex flex-row items-center">
						{#if chatStore.selectedChat}
							<Dots status={connectionStatus[chatStore.selectedChat.room_id]} />
							<span class="ml-1 capitalize shadow">
								{connectionStatus[chatStore.selectedChat.room_id]}
							</span>
						{/if}
					</span>
				</div>
				<!-- {chatStore.selectedChat?.mute_start_date}
				{chatStore.selectedChat?.mute_duration}
				{JSON.stringify(is_room_muted().mute_info)} -->
				{#if is_room_muted().mute_info.isMutedNowOrLater}
					<p class="text-red">
						Room have been muted ! {is_room_muted().mute_info.muted_summary}
					</p>
				{/if}
				{#if is_user_muted().mute_info.isMutedNowOrLater}
					<p class="text-red">
						You have been muted ! {is_room_muted().mute_info.muted_summary}
					</p>
				{/if}
				<!-- {JSON.stringify(chatStore.selectedChat?.mute_start_date)}
				{JSON.stringify(chatStore.selectedChat?.duration)} -->
				<!-- <div class="font-light shadow">
					<Text
						enableMore={true}
						wordLimit={100}
						text={chatStore.selectedChat?.description}
					>
					</Text>
				</div> -->
			</div>
			{#if announcement?.body && visibilityAnnouncement.data && (!announcement.start || (announcement.start <= Date.now() && announcement.start < announcement.end))}
				<div class="bg-yellow-100 m-2 p-3 shadow text-sm mt-5">
					<Text
						class=""
						text={announcement.body}
						wordLimit={200}
						enableMore={true}
					></Text>
					<!-- disabled for now -->
					<div>
						<Button
							variant="outline"
							class="float-right hidden"
							disabled={!isChatConnected || !announcement}
							size="sm"
							onclick={() => {
								if (announcement)
									hideAnnouncement.mutate(announcement, {
										onSuccess: () => {
											announcement = undefined;
										}
									});
							}}
						>
							Hide
						</Button>
					</div>
				</div>
			{/if}
			<!-- <pre>{JSON.stringify(roommates.data, null, 2)}</pre> -->
			<div
				class="px-2 flex flex-col justify-start overflow-x-hidden overflow-y-auto min-h-0 bg-[#f4fffc] relative"
				id="chat-feed"
				bind:this={chatFeed}
			>
				<!-- 	 <VirtualList class='mystyle' style='width:100%;height=600px' items={room_msg.filter((v) => v !== undefined)}>
			</VirtualList> -->
				{#each room_msg.filter((v) => v !== undefined) as message}
					{@const isEvents = !message.message}
					{@const roomMessage = Object.values(message)![0]}
					{@const type = Object.keys(message)![0]}
					<!-- 	<pre>{JSON.stringify(message, null, 2)}</pre> -->
					{#if isEvents && !isUserMessage(message)}
						{@const Sys = getUserEventIcon(roomMessage)}
						<div
							class="text-sm p-2 rounded font-600 text-lg shadow text-center"
							style="background:#FFB26F; "
							transition:fade
						>
							{#if Sys && Sys.Icon}
								<Sys.Icon class="inline-block mr-2" />
							{/if}
							[{roomMessage?.type || type}]: {roomMessage?.reason ||
								roomMessage?.body ||
								roomMessage?.msg ||
								'Missing System Message(Bug)'}
						</div>
					{/if}
					{#if !isEvents && roomMessage && isUserMessage(message)}
						<ChatBubble
							message={message.message}
							align={message.message?.user_id == user.id ? 'right' : 'left'}
							poster={{ user_id: message.message?.user_id }}
						/>
					{/if}
				{/each}
				{#if typingText}
					<div
						class="border-2 bg-stone-100 h-10 text-amber-800 shadow w-1/2 mx-auto text-sm font-bold text-center"
						transition:fly={{ y: 40, duration: 500 }}
					>
						{typingText}
					</div>
				{/if}

				<div id="anchor">-</div>
			</div>
			<div
				class="sticky bottom-[2px] bg-white flex flex-col gap-2 shadow w-full"
			>
				{#if refStates.ref_message}
					<div
						class="text-sm text-zinc-400 text-center truncate max-h-4em overflow-hidden px-2 break-all"
					>
						<div>
							Relying: <button onclick={resetRefMessage}>stop reply</button>
						</div>
						{@html refStates.ref_message?.body}
					</div>
				{/if}
				<div class="flex h-3em gap-2 p-2">
					<Toggle
						size="sm"
						class="border-3 border-green-200"
						onclick={() => {
							isPreview = !isPreview;
						}}
					>
						Preview MarkDown
					</Toggle>
					<Popover>
						{#snippet button(builder)}
							<Button
								class="border-3 border-green-200"
								size="sm"
								variant="secondary"
								{...builder}
							>
								<Smile />
							</Button>
						{/snippet}
						{#snippet children()}
							<div class="grid grid-cols-8">
								{#each emojis as e}
									<Button
										onclick={() => insertEmo(e)}
										variant="ghost"
										class="text-lg  m-0"
										size="sm"
									>
										{e.trim()}
									</Button>
								{/each}
							</div>
						{/snippet}
					</Popover>

					<!-- <Button size="sm" variant="secondary">
						<MessageCircleOff
							size={16}
							onclick={() => {
								alertStore.openManager = true;
							}}
						/>
					</Button> -->
					{#if isModOrAdmin(chatStore?.currRoomUser)}
						<Button
							size="sm"
							disabled={!isChatConnected}
							variant="secondary"
							onclick={() => (dialogStats.announcement = true)}
						>
							<Announcement />
						</Button>
						<AlertMuteAll />
						<Button
							size="sm"
							onclick={() => {
								openState.openManager = true;
							}}
							variant="secondary"
						>
							Manage
						</Button>
					{/if}

					<span
						class="text-gray align-bottom"
						class:text-red={writerStore.content.length >=
							MAX_USER_CHAT_MESSAGE_LENGTH}
					>
						{writerStore.content.length}/{MAX_USER_CHAT_MESSAGE_LENGTH}
					</span>
				</div>
				<div class="flex">
					{#if isPreview}
						<p class="bg-gray-50 p-2 min-h-120px w-full cursor-not-allowed">
							{@html html}
						</p>
					{/if}
					{#if !isPreview}
						<Textarea
							disabled={isPreview}
							class="focus-visible:ring-0 min-h-120px self-stretch grow-1"
							placeholder="Type a message...with markdown !"
							bind:value={writerStore.content}
							oninput={() => {
								console.log('aa');
								typing.update();
							}}
							maxlength={MAX_USER_CHAT_MESSAGE_LENGTH}
						/>
					{/if}
					<Button
						class="h-auto!"
						disabled={!isChatConnected || !writerStore.content}
						onclick={() =>
							sendMessage({ body: writerStore.content, title: '' })}
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</section>
		<section class="bg-white">
			<div
				class="border-amber border-b-1 text-center shadow-gentle flex justify-center"
			>
				<Satellite class="inline" />
				<h1 class="text-center inline text-lg font-semibold mb-4 h-fit px-4">
					Books
				</h1>
			</div>
			<div class="p-5">
				<UserActivities users={roommates.data} />
				<!-- 	{#each [1] as activity}
					<div
						class="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
						role="alert"
					>
						<span class="font-medium">Info alert!</span>
						User X created a comment on book
					</div>
					<div
						class="mt-2 bg-teal-500 text-sm text-white rounded-lg p-4"
						role="alert"
						tabindex="-1"
						aria-labelledby="hs-solid-color-success-label"
					>
						<span id="hs-solid-color-success-label" class="font-bold">
							Success
						</span>
						alert! You should check in on some of those fields below.
					</div>
					<div
						class="mt-2 bg-red-500 text-sm text-white rounded-lg p-4"
						role="alert"
						tabindex="-1"
						aria-labelledby="hs-solid-color-danger-label"
					>
						<span id="hs-solid-color-danger-label" class="font-bold">
							Danger
						</span>
						alert! You should check in on some of those fields below.
					</div>
				{/each} -->
			</div>
		</section>
	</main>
</div>

<style>
	.text-effect {
		color: rgba(0, 0, 0, 0.6);
		text-shadow:
			rgba(0, 0, 0, 0.2) 2px 6px 5px,
			rgba(255, 255, 255, 0.4) 0 -4px 30px;
	}
	#chat-feed {
		height: 600px;
	}
	/* :global(#chat-feed *) {
		overflow-anchor: none;
	} */
	#anchor {
		overflow-anchor: auto;
		height: 5px;
		opacity: 0;
	}
</style>
