<script lang="ts">
	import Dialog from '$components/dialog.svelte';
	import { useClearChatInboxRead, useGetChatInbox } from './query';
	import { openState } from './store.svelte';
	import { Button } from '$lib/components/ui/button';
	
const messages = useGetChatInbox();
	const unread = $derived(
		messages.data?.events?.filter((v) => {
			return new Date(v.created_at) > new Date(messages.data?.lastReadAt);
		}) || []
	);
	const del = useClearChatInboxRead();
</script>

<!-- <Button variant="outline" class="relative">
	<MessageCircle class="h-5 w-5 mr-2" />
	Inbox
	{#if unread.length > 0}
		<span
			class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
		>
			{unread.length}
		</span>
	{/if}
</Button> -->
<Dialog bind:open={openState.openInbox}>
	{#snippet children()}
		<Button
			variant="ghost"
			disabled={del.isPending}
			onclick={() =>
				del.mutate(null, {
					onSuccess: () => {
						Object.assign(messages.data, { events: [] });
					}
				})}
		>
			Clear
		</Button>
		{#each messages.data?.events || [] as message (message.id)}
			<div
				class={`p-4 border-b last:border-b-0 ${
					message.created_at < messages.data?.lastReadAt
						? 'bg-white'
						: 'bg-blue-50'
				}`}
			>
				<b>{message.event_type}</b>
				{@html message.description}
			</div>
		{/each}
		{#if messages.data?.events?.length == 0 || !messages}
			No Events
		{/if}
	{/snippet}
</Dialog>
