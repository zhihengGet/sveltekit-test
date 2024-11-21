<script lang="ts">
	import SimplePaginationUi from '$components/SimplePaginationUi.svelte';
	import { useGetPublicChatrooms } from '$lib/queries/chat/chatrooms';
	import Users from 'lucide-svelte/icons/users'
import User from 'lucide-svelte/icons/user';
	import { CopyInviteURL } from '../chat/util.svelte';

	// Mock data for chatrooms
	const chatrooms = [
		{
			id: 1,
			title: 'Fantasy Writers Unite',
			description:
				'A place for fantasy authors to discuss world-building and magic systems.',
			users: 42,
			owner: 'Elara Moonwhisper'
		}
	];
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6 text-center">Author Writing Groups</h1>

	<SimplePaginationUi
		useQuery={useGetPublicChatrooms}
		hasSize={false}
		getLastCursor={(data) => {
			if (data.length) {
				return data.at(-1)?.room_id;
			}
		}}
		cursorPagination={true}
		size={50}
	>
		{#snippet child({ data })}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data ?? [] as room (room.room_id)}
					<div
						class="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col"
					>
						<button
							class="flex flex-col space-y-1.5 p-6 hover:text-blue"
							onclick={CopyInviteURL(room.room_id, '')}
						>
							<h3 class="text-2xl font-semibold leading-none tracking-tight">
								{room.name}
							</h3>
							<p class="text-sm text-muted-foreground">{room.description}</p>
						</button>
						<div class="p-6 pt-0 flex-grow">
							<div class="flex items-center justify-between mt-4">
								<div class="flex items-center space-x-2">
									<Users class="w-5 h-5 text-muted-foreground" />
									<span class="text-sm text-muted-foreground">
										{room.user_count}/{room.max_user} users
									</span>
								</div>
								<div class="flex items-center space-x-2">
									<User class="w-5 h-5 text-muted-foreground" />
									<a
										class="text-sm text-muted-foreground"
										href="/profile/{room.owner_id}"
									>
										{room.owner_name}
									</a>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/snippet}
	</SimplePaginationUi>
</div>
