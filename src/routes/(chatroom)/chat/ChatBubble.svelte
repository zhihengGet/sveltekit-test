<script lang="ts">
	import { slide } from 'svelte/transition';
	import {
		chatStore,
		refStates,
		setRefMessage,
		writerStore,
		type IncomingMessages
	} from './store.svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { toHTML } from './render';
	import Avatar from '$components/avatar.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import MoreHorizontal from 'lucide-svelte/icons/more-horizontal';
	import FoldVertical from 'lucide-svelte/icons/fold-vertical';
	import MoreVertical from 'lucide-svelte/icons/more-vertical';
	import MessageSquare from 'lucide-svelte/icons/message-square';
	import Copy from 'lucide-svelte/icons/copy';
	import Flag from 'lucide-svelte/icons/flag';
	import Volume2 from 'lucide-svelte/icons/volume-2';
	import UserX from 'lucide-svelte/icons/user-x';
	import Import from 'lucide-svelte/icons/import';
	import { user } from '$lib/state/runes.svelte';
	import './markdown.css';
	import { isBefore } from 'date-fns';
	import { MINUTE } from '$lib/data/constants';
	import Drawer from '$components/Drawer.svelte';
	import { AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		Card,
		CardContent,
		CardHeader,
		CardFooter
	} from '$lib/components/ui/card';
	import { cubicIn, cubicOut } from 'svelte/easing';

	import { useGetRoommates } from './query';
	import Badge from '$components/ui/badge/badge.svelte';
	let {
		align,
		message,
		poster
	}: {
		align: 'left' | 'right';
		message: NonNullable<IncomingMessages['message']>;
		poster: { user_id: string };
	} = $props();

	let room_info = $derived(chatStore.wsRoomInfo);
	let username = $derived(room_info?.users.get(poster.user_id));
	$inspect('username is', room_info);
	let openMessageReference = $state(false);
	let ref = $state('');
	function handleRef() {
		setRefMessage(message);
	}
	const roommates = useGetRoommates(() => chatStore.selectedChat?.room_id);
	function getUserName(s: string) {
		let u = roommates.data?.find((v) => v.user_id == s);
		return u?.name ?? 'Unknown';
	}
	const progress = cubicIn(0, {
		duration: 400,
		easing: cubicIn
	});
</script>

{#snippet options()}
	<DropdownMenu>
		<DropdownMenuTrigger>
			<FoldVertical class="w-4 h-4" />
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" class="w-40">
			<!-- <DropdownMenuItem>
				<UserX class="w-4 h-4 mr-2" />
				<span>Kick</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<Flag class="w-4 h-4 mr-2" />
				<span>Ban</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<Volume2 class="w-4 h-4 mr-2" />
				<span>Mute</span>
			</DropdownMenuItem> -->
			<DropdownMenuItem
				onclick={() => {
					writerStore.content += `[@${username?.name}](/profile/${poster.user_id})`;
				}}
			>
				<Copy class="w-4 h-4 mr-2" />
				<span>@Mention</span>
			</DropdownMenuItem>
			<DropdownMenuItem onclick={handleRef}>
				<MessageSquare class="w-4 h-4 mr-2" />
				<span>Reference</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{/snippet}
{#snippet RefUi(message)}
	{#if message.reply_id}
		<Badge
			onclick={() => {
				ref = message.parent_content;
				openMessageReference = true;
			}}
			variant="outline"
			class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"
		>
			<button>A Reply to {getUserName(message.user_id)}</button>
		</Badge>
	{/if}
{/snippet}

{#if align == 'right'}
	<div
		class="flex justify-end items-center my-1"
		in:slide={{ duration: 200, axis: 'y' }}
	>
		{@render options()}
		<!-- 	<Card
			class={`w-1/2 ${message.user_id == user.id ? 'bg-zinc-100 ' : 'bg-muted'}`}
		>
			<CardContent class="p-2">
				<div class="flex items-center space-x-2 mb-1">
					<span class="text-xs font-semibold">{username?.name}</span>
					<span class="text-xs">{username?.role}</span>
				</div>

				<div
					class="bg-background/30 text-gray border-1 p-2 rounded-md mb-2 text-xs"
				>
					<p class="font-semibold">
						{getUserName(message.user_id)}
					</p>
					<p class="">{@html message.parent_content}</p>
				</div>

				<p class="text-sm chat-box">{@html message.body}</p>
			</CardContent>
			<CardFooter class="text-xs p-3 pt-0">
				{timeAgo(message.created_at)}
			</CardFooter>
		</Card> -->
		<span class="flex flex-col max-w-1/2">
			<div>
				<div class="text-sm">
					<span class="flex justify-end items-center">
						<span
							class="inline-block text-xs font-600 truncate max-w-1/2 text-right mr-1"
						>
							{username?.name}
						</span>
						<Badge
							class=" {username?.role == 'admin'
								? 'bg-red text-zinc-100 hover:bg-red-500'
								: username?.role == 'moderator'
									? ' bg-yellow-50  text-xs  text-yellow-800 hover:bg-yellow'
									: ''} text-xs font-medium p-1! py-0! capitalize"
						>
							{chatStore.currRoomUser?.role}
						</Badge>
					</span>
				</div>
			</div>

			<div class="thought chat-box">
				<div>{@html message.body}</div>
			</div>
			{@render RefUi(message)}
			{#if isBefore(message.created_at, Date.now() - MINUTE)}
				<div class="text-sm text-gray text-right">
					{timeAgo(message.created_at)}
				</div>
			{/if}
		</span>

		<div class="grow-0"><Avatar {user} /></div>
	</div>
{/if}

{#if align == 'left'}
	<div class="mb-5 flex items-start space-x-2 justify-start chat-box">
		<span class="inline-block">
			<div
				class="inline-flex flex- row items-center justify-center h-full border-2 rounded-full"
			>
				<Avatar userId={poster.user_id} username={username?.name} />
			</div>
		</span>
		<div class="inline-block w-fit">
			<div class="text-sm mb-2 font-light">
				<div class=" inline">
					{#if username?.role}
						<Badge
							class=" {username?.role == 'admin'
								? 'bg-red text-zinc-100 hover:bg-orange-500'
								: username?.role == 'moderator'
									? ' bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-500'
									: ''} text-xs font-medium p-1! py-0! capitalize"
						>
							{username.role}
						</Badge>
					{/if}
					<span class="text-xs font-bold">{username?.name}</span>
					{#if isBefore(message.created_at, Date.now() - MINUTE)}
						<span class="">{timeAgo(message.created_at)}</span>
					{/if}
				</div>
			</div>

			<div class="thought chat-box">
				<div>{@html message.body}</div>
			</div>
			{#if message.reply_id}
				{@render RefUi(message)}
			{/if}
			{@render options()}
		</div>
	</div>
{/if}
<Drawer
	bind:open={openMessageReference}
	title="referenced message"
	description=""
>
	{#snippet children()}
		<p class="chat-box">{@html ref}</p>
	{/snippet}
</Drawer>

<style>
	:global(a) {
		color: blue;
	}
	.thought {
		position: relative;
		display: inline-flex;
		background-color: #fff;
		padding: 2px;
		border-radius: 15px;
		min-width: 150px;
		max-width: auto;
		min-height: 40px;
		margin: 1px;
		position: relative;
		align-items: center;
		justify-content: center;
		text-align: center;
		border: 2px solid lightgrey;
	}
	:global(.dark .thought) {
		background-color: #161616;
	}
	.thought:before,
	.thought:after {
		content: '';
		background-color: #fff;
		border-radius: 50%;
		display: block;
		position: absolute;
		z-index: -1;
	}
	.thought:before {
		width: 44px;
		height: 44px;
		top: -12px;
		left: 28px;
		box-shadow: -50px 30px 0 -12px #fff;
	}
	.thought:after {
		bottom: -10px;
		right: 26px;
		width: 30px;
		height: 30px;
		box-shadow:
			40px -34px 0 0 #fff,
			-28px -6px 0 -2px #fff,
			-24px 17px 0 -6px #fff,
			-5px 25px 0 -10px #fff;
	}
	#messages-container * {
		overflow-anchor: none;
	}

	#anchor {
		overflow-anchor: auto;
		height: 1px;
	}
</style>
