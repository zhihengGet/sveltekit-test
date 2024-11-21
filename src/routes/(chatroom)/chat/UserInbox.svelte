<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import Ban from 'lucide-svelte/icons/ban'
import X from 'lucide-svelte/icons/x'
import Bell from 'lucide-svelte/icons/bell'
import MessageCircle from 'lucide-svelte/icons/message-circle';
	import Dialog from '$components/dialog.svelte';
	import { useClearChatInboxRead, useGetChatInbox } from './query';
	import { isAfter } from 'date-fns';
	import { openState } from './store.svelte';

	type Message = {
		id: number;
		chatRoom: string;
		action: 'kicked' | 'banned';
		timestamp: string;
		read: boolean;
	};
	const events = useGetChatInbox();
	const clear = useClearChatInboxRead();

	let isInboxVisible = $state(false);

	const unread = $derived(
		events.data?.events?.filter(
			(msg) =>
				new Date(msg.created_at).getTime() >
				new Date(events.data?.lastReadAt).getTime()
		) ?? []
	);

	function markAllAsRead() {}
	function toggleInbox() {
		isInboxVisible = !isInboxVisible;
	}
	let open = $state(false);
</script>

<div class="relative w-fit">
	<Button
		variant="ghost"
		size="sm"
		class="relative"
		onclick={() => (openState.openInbox = true)}
	>
		<Bell class="h-4 w-4" />
		<span
			class="absolute top-0 right-0 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center"
		>
			{unread.length}
		</span>
	</Button>

	<Dialog bind:open>
		{#snippet children()}
			<Card class="w-full max-w-md mx-auto">
				<CardHeader
					class="flex flex-row items-center justify-between space-y-0 pb-2"
				>
					<div class="flex items-center space-x-2">
						<MessageCircle class="h-6 w-6" />
						<CardTitle class="text-2xl font-bold">Inbox</CardTitle>
						<span
							class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
						>
							{unread.length}
						</span>
					</div>
					<Button variant="outline" size="sm" onclick={markAllAsRead}>
						Mark all as read
					</Button>
				</CardHeader>
				<CardContent>
					<ScrollArea class="h-[70vh] w-full pr-4">
						{#each inboxs.data?.events || [] as message (message.id)}
							<p>{message.description}</p>
						{/each}

						<div class="text-center text-gray-500 py-4">
							No messages to display
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		{/snippet}
	</Dialog>
</div>
