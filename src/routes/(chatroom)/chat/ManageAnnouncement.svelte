<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import {
		announcementInputSchema,
		announcementSchema
	} from '$lib/schema/chatSchema';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { sendSetAnnouncement, useCreateAnnouncement } from './query';
	import { connectionCache } from './render';
	import { chatStore, type IncomingMessages } from './store.svelte';

	let {
		open = $bindable(),
		webSocket,
		data
	}: {
		open: boolean;
		webSocket: WebSocket | null;
		data?: IncomingMessages['announce'];
	} = $props();
	const create = useCreateAnnouncement();
	let inputData = $state({ title: '', body: '', hour: 12 });
	let expire = $derived(
		typeof data?.start == 'number' && typeof data.end == 'number'
	);
	const hour = 1000 * 60 * 60;
	$effect(() => {
		if (data) {
			inputData.title = data?.title;
			inputData.body = data?.body;
			inputData.hour =
				typeof data?.start == 'number' && typeof data.end == 'number'
					? Math.max(Math.ceil(data.end - data.start) / hour, 0)
					: 0;
		}
	});
	let error = $state('');
	function handleSave() {
		if (error) {
			return console.error('error', error);
		}
		if (!webSocket) {
			return console.error('ws does not exists', webSocket, inputData.hour);
		}
		const payload = {
			type: 'announcement',
			room_id: chatStore.selectedChat?.room_id,
			body: inputData.body,
			title: inputData.title,
			start: Date.now(),
			end: Date.now() + inputData.hour * hour,
			created_at: Date.now()
		};
		sendSetAnnouncement(webSocket, payload);
		/* 	create.mutate({
			room_id: chatStore.selectedChat?.room_id,
			body: inputData.body,
			title: inputData.title,
			start: Date.now(),
			end: Date.now() + inputData.hour
		}); */
	}
	function handleDel() {
		if (!webSocket) {
			return alert('Lost connection to server please refresh');
		}
		const payload = {
			room_id: chatStore.selectedChat?.room_id,
			body: '',
			title: '',
			start: 0,
			end: -1,
			created_at: Date.now()
		};
		sendSetAnnouncement(webSocket, payload);
	}
	let errorData = $derived(
		announcementInputSchema.safeParse(inputData).error?.format()
	);
</script>

<Drawer
	bind:open
	title="Manage Announcement"
	description="Manage Your Announcement,You can use it to organize events/contests with your group members!"
>
	<!-- 	{#snippet trigger()}
		<Button>
			<Announcement />
		</Button>
	{/snippet} -->
	{#snippet children()}
		{#if errorData}
			{#each Object.keys(errorData) as e}
				<p class="text-sm text-red-500">{errorData[e]._errors}</p>
			{/each}
		{/if}
		<form onsubmit={handleSave} class="space-y-4">
			<div class="space-y-2">
				<Label for="title">Title</Label>
				<Input
					id="title"
					placeholder="Enter announcement title"
					bind:value={inputData.title}
				/>
			</div>
			<div class="space-y-2">
				<Label for="content">Content</Label>
				<Textarea
					id="content"
					placeholder="Enter announcement content"
					class="resize-none"
					bind:value={inputData.body}
				/>
			</div>
			<div class="space-y-2">
				<span class="text-gray text-sm block">
					expire {typeof data?.start == 'number' && typeof data.end == 'number'
						? timeAgo(data.end, data.start)
						: null}
				</span>
				<Label for="timeToLive">Expire In (hours)</Label>
				<Input id="timeToLive" type="number" bind:value={inputData.hour} />
			</div>
		</form>
	{/snippet}
	{#snippet footer()}
		<Button onclick={handleSave}>Update</Button>
		<Button onclick={handleDel}>Delete</Button>
	{/snippet}
</Drawer>
