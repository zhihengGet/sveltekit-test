<script lang="ts">
	import Bell from 'lucide-svelte/icons/bell';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		Popover,
		PopoverContent,
		PopoverTrigger
	} from '$lib/components/ui/popover';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge'; // Mock data for demonstration
	import { useGetAllFollowerMessageListForUser } from '$lib/queries/message/followMessage';
	import {
		useGetMessageReadOrNot,
		useMarkMessageRead
	} from '$lib/queries/message/inbox';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import Avatar from '$components/avatar.svelte';
	import { getPublicAvatarUrlSync } from '$lib/queries/storage/ObjectKey';
	import { OvalSpinner } from '$lib/icons';
	import { sortBy } from 'lodash-es';
	import { formatDistanceToNow } from 'date-fns';

	function toggleMessageExpansion(id: number) {
		expandMessage;
	}
	const all_message = useGetAllFollowerMessageListForUser();
	const isRead = useGetMessageReadOrNot();
	function formatDate(dateString: string | Date | number) {
		return formatDistanceToNow(dateString);
	}
	//let author_ids: string[] = $derived(Object.keys(all_message.data ?? {}));
	let all_message_list = $derived(
		sortBy(
			Object.values(all_message.data ?? {})
				.filter((v) => v && typeof v !== 'undefined')
				.map((v) => v.messages)
				.flat(),
			(v) => -v.created_at
		) ?? []
	);
	let unread = $derived(all_message_list.some((v) => v.is_read == false));
	const marker = useMarkMessageRead();
	function mark_all_as_read() {
		marker.mutate({
			...isRead.data,
			asdfds: 1,
			follower: { last_open_date: Date.now() }
		});
	}
	let expandMessage: { [s in string]: boolean } = $state({});
</script>

<Popover
	onOpenChange={(v) => {
		/* if (v) mark_read(); */
	}}
>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon" class="relative">
				<Bell class="h-4 w-4" />
				{#if isRead.isLoading}
					<OvalSpinner class="absolute top-1/2" />
				{/if}
				<span
					class:hidden={unread == false}
					class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"
				></span>
				<span class="sr-only">Toggle notifications</span>
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="w-80 sm:w-96">
		<div>
			<CardHeader>
				<CardTitle>Recent Messages</CardTitle>
				<CardDescription>From your subscribed bloggers</CardDescription><Button
					variant="ghost"
					onclick={() => mark_all_as_read()}
					size="sm"
				>
					Mark Read All
				</Button>
			</CardHeader>
			<CardContent>
				<ScrollArea class="h-fit max-h-[300px] sm:h-[400px]">
					<QueryLoaderRunes CreateQueryResult={all_message}>
						{#each all_message_list || [] as item, index}
							<div class="mb-1 pb-4 last:border-b-1 bg-">
								<div class="flex justify-between items-center mb-2">
									<Avatar
										src={getPublicAvatarUrlSync({ uid: item.author_id })}
									/>
									<h3 class="text-sm h-fit max-w-200px font-semibold truncate">
										{item.author_name ?? 'Error Fetching'}
									</h3>

									<Button
										variant="ghost"
										size="sm"
										onclick={() => {
											console.log('clicked', expandMessage[index]);
											expandMessage[index] = !expandMessage[index];
										}}
									>
										{#if expandMessage[index]}
											<ChevronUp class="h-4 w-4" />
										{:else}
											<ChevronDown class="h-4 w-4" />
										{/if}
									</Button>
								</div>
								<div
									class="flex justify-between items-center mb-2 text-xs text-muted-foreground"
								>
									<Badge variant="secondary">
										Created: {formatDate(item.created_at)}
									</Badge>
									<!-- <Badge variant="outline">
										Expires: {formatDate(item?.expirationDate)}
									</Badge> -->
								</div>
								<p class="text-sm mt-2">
									{#if expandMessage[index]}
										{item.message}
									{:else}
										{item.message.length > 100
											? item.message.slice(0, 100) + '...'
											: item.message}
									{/if}
								</p>
								{#if !expandMessage[index] && item.message.length > 100}
									<Button
										variant="link"
										size="sm"
										class="mt-1 p-0 h-auto"
										onclick={() => toggleMessageExpansion(index)}
									>
										Read more
									</Button>
								{/if}
							</div>
						{/each}
					</QueryLoaderRunes>
				</ScrollArea>
			</CardContent>
			<CardFooter>
				<Button variant="outline" size="sm" class="w-full" href="/inbox">
					View All
				</Button>
			</CardFooter>
		</div>
	</PopoverContent>
</Popover>
