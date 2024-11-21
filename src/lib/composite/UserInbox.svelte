<script lang="ts">
	// Importing UI components from the modified library paths
	import {
		Avatar,
		AvatarFallback,
		AvatarImage
	} from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/ui/tabs';
	import Bell from 'lucide-svelte/icons/bell';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { format } from 'date-fns';
	import {
		useGetAllFollowerMessageListForUser,
		useGetSiteMessages
	} from '$lib/queries/message/followMessage';
	import {
		useGetMessageReadOrNot,
		useMarkMessageRead
	} from '$lib/queries/message/inbox';
	import { getPublicAvatarUrlSync } from '$lib/queries/storage/ObjectKey';
	import type { message_types } from '$lib/schema/messageSchemas';

	// Defining TypeScript types
	type Followee = {
		id: string;
		name: string;
		avatar: string;
		unreadCount: number;
	};

	type Message = {
		id: string;
		senderId: string;
		content: string;
		isRead: boolean;
		timestamp: string;
	};

	// Sample data for followees and messages
	const followees: Followee[] = [
		{
			id: '1',
			name: 'Alice',
			avatar: '/placeholder.svg?height=32&width=32',
			unreadCount: 3
		},
		{
			id: '2',
			name: 'Bob',
			avatar: '/placeholder.svg?height=32&width=32',
			unreadCount: 1
		},
		{
			id: '3',
			name: 'Charlie',
			avatar: '/placeholder.svg?height=32&width=32',
			unreadCount: 0
		}
	];

	const messages: Message[] = [
		{
			id: '1',
			senderId: '1',
			content: 'Hey, how are you?',
			isRead: false,
			timestamp: '2023-09-26T10:00:00Z'
		},
		{
			id: '2',
			senderId: '1',
			content: 'Did you see the latest update?',
			isRead: false,
			timestamp: '2023-09-26T10:05:00Z'
		},
		{
			id: '3',
			senderId: '2',
			content: 'Meeting at 3 PM today',
			isRead: false,
			timestamp: '2023-09-26T09:30:00Z'
		},
		{
			id: '4',
			senderId: '1',
			content: "Let's catch up soon!",
			isRead: false,
			timestamp: '2023-09-26T11:00:00Z'
		}
	];

	const siteMessages: Message[] = [
		{
			id: '5',
			senderId: 'site',
			content: 'Welcome to Insite! Check out our new features.',
			isRead: false,
			timestamp: '2023-09-25T15:00:00Z'
		},
		{
			id: '6',
			senderId: 'site',
			content: 'Your account has been verified.',
			isRead: true,
			timestamp: '2023-09-24T14:30:00Z'
		}
	];

	// State management using Svelte 5 runes
	let selectedFollowee = $state<string | null | undefined>(null);
	let currentPage = $state(1);
	let showBanner = $state(true);
	const messagesPerPage = 5;
	const follower_message = useGetAllFollowerMessageListForUser();
	const site = useGetSiteMessages();
	//const follower_message = use();
	const messages_list = $derived(
		Object.values(follower_message.data ?? {})
			.map((v) => v.messages)
			.flat()
	);
	let filteredMessages = $derived.by(() => {
		return selectedFollowee
			? (follower_message.data?.[selectedFollowee]?.messages ?? [])
			: messages_list;
	});
	const has_read = useGetMessageReadOrNot();
	const author_ids = $derived(Object.keys(follower_message.data ?? []));
	const author_list = $derived(
		Object.values(follower_message.data ?? []).map((v) => ({
			unread_count: v.messages.filter((v) => v.is_read == false).length,
			author_name: v.author_name ?? 'Error',
			author_id: v.author_id
		}))
	);
	$effect(() => {
		if (!selectedFollowee) {
			selectedFollowee = author_ids[0];
		}
	});
	let totalPages = $derived.by(() =>
		Math.ceil(filteredMessages.length / messagesPerPage)
	);
	const mark = useMarkMessageRead();
	let paginatedMessages = $derived(() => {
		return filteredMessages.slice(
			(currentPage - 1) * messagesPerPage,
			currentPage * messagesPerPage
		);
	});
	function read_all(type: message_types = 'follower') {
		mark.mutate({
			...has_read.data,
			[type]: { last_open_date: Date.now() }
		});
		has_read.data = {
			...(has_read.data ?? []),
			[type]: { last_open_date: Date.now() }
		};
	}
	// Function to toggle the read status of a message
	const toggleReadStatus = (messageId: string) => {
		// In a real app, you'd update this in your backend
		console.log(`Toggling read status for message ${messageId}`);
	};
</script>

<!-- Main Container -->
<div class="container mx-auto p-4">
	<!-- Banner Section -->
	<!-- 	{#if showBanner}
		<div
			class="bg-blue-500 text-white p-4 mb-4 rounded-lg flex justify-between items-center"
		>
			<span>Welcome to your new Insite inbox!</span>
			<Button variant="ghost" onclick={() => (showBanner = false)}>
				Close
			</Button>
		</div>
	{/if} -->

	<!-- Inbox Card -->
	<Card class="w-full max-w-4xl mx-auto">
		<!-- Card Header -->
		<CardHeader>
			<CardTitle>Inbox</CardTitle>
		</CardHeader>

		<!-- Card Content -->
		<CardContent>
			<Tabs value="messages">
				<!-- Tabs List -->
				<TabsList>
					<TabsTrigger value="messages">Messages</TabsTrigger>
					<TabsTrigger value="site">Site Messages</TabsTrigger>
				</TabsList>

				<!-- Messages Tab Content -->
				<TabsContent value="messages">
					<Button
						size="sm"
						variant="destructive"
						class="px-2 bg-neutral rounded-1"
						onclick={() => read_all()}
					>
						Mark All Read
					</Button>
					<div class="grid grid-cols-4 gap-4">
						<!-- Followees Sidebar -->
						<div class="col-span-1 border-r pr-4">
							<h3 class="font-semibold mb-2">Followees</h3>
							<ScrollArea class="h-[400px]">
								{#each author_list as followee}
									<Button
										variant={selectedFollowee === followee.author_id
											? 'secondary'
											: 'ghost'}
										class="w-full justify-start mb-2"
										onclick={() => (selectedFollowee = followee.author_id)}
									>
										<Avatar class="h-8 w-8 mr-2">
											<AvatarImage
												src={getPublicAvatarUrlSync({
													uid: followee.author_id
												})}
												alt={'Invalid'}
											/>
											<AvatarFallback>
												{followee.author_name?.[0]}
											</AvatarFallback>
										</Avatar>
										<span class="max-w-30px truncate">
											{followee.author_name}
										</span>
										<!-- {#if followee.unread_count > 0} -->
										<Badge variant="destructive" class="ml-auto">
											{followee.unread_count}
										</Badge>
										<!-- 	{/if} -->
									</Button>
								{/each}
							</ScrollArea>
						</div>

						<!-- Messages Content Area -->
						<div class="col-span-3">
							<ScrollArea class="h-[400px]">
								{#each paginatedMessages() as message}
									<Card class="mb-2">
										<CardContent class="p-4">
											<div class="flex justify-between items-center mb-2">
												<span class="font-semibold">
													{message.author_name}
												</span>
												<span class="text-sm text-gray-500">
													{format(new Date(message.created_at), 'PPpp')}
												</span>
											</div>
											<p>{message.message}</p>
											<!-- 	<Button
												variant="ghost"
												size="sm"
												class="mt-2"
												onclick={() => toggleReadStatus(message.id)}
											>
												{message.isRead ? 'Mark as Unread' : 'Mark as Read'}
											</Button> -->
										</CardContent>
									</Card>
								{/each}
							</ScrollArea>

							<!-- Pagination Controls -->
							<div class="flex justify-between items-center mt-4">
								<Button
									variant="outline"
									onclick={() => (currentPage = Math.max(1, currentPage - 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft class="h-4 w-4 mr-2" />
									Previous
								</Button>
								<span>Page {currentPage} of {totalPages}</span>
								<Button
									variant="outline"
									onclick={() =>
										(currentPage = Math.min(totalPages, currentPage + 1))}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight class="h-4 w-4 ml-2" />
								</Button>
							</div>
						</div>
					</div>
				</TabsContent>

				<!-- Site Messages Tab Content -->
				<TabsContent value="site">
					<!-- <Button
						size="sm"
						variant="destructive"
						class="px-2 bg-neutral rounded-1"
						onclick={() => read_all('site')}
					>
						Mark All Read
					</Button> -->
					<ScrollArea class="h-[400px]">
						{#each site.data ?? [] as message}
							<Card class="mb-2">
								<CardContent class="p-4">
									<div class="flex justify-between items-center mb-2">
										<span class="font-semibold flex items-center">
											<Bell class="h-4 w-4 mr-2" />
											Site Message [{site.data?.length}]
										</span>
										<span class="text-sm text-gray-500">
											{format(new Date(message.created_at), 'PPpp')}
										</span>
									</div>
									<p>{message.message}</p>
									<!-- 	<Button
										variant="ghost"
										size="sm"
										class="mt-2"
										onclick={() => toggleReadStatus(message.id)}
									>
										{message.isRead ? 'Mark as Unread' : 'Mark as Read'}
									</Button> -->
								</CardContent>
							</Card>
						{/each}
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>
</div>
