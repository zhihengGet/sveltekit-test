<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import X from 'lucide-svelte/icons/x';
	import { useDeleteResources, useAddResources, usGetResources } from './query';
	import { chatStore, openState } from './store.svelte';
	import Button from '$components/button.svelte';
	import Book from 'lucide-svelte/icons/book'
import Link from 'lucide-svelte/icons/link'
import Plus from 'lucide-svelte/icons/plus';
	import ScrollArea from '$components/ui/scroll-area/scroll-area.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import { user } from '$lib/state/runes.svelte';
	import type { chatResource } from '$lib/schema/chatSchema';

	let add = useAddResources();
	let data = usGetResources(() => chatStore.selectedChat?.room_id);
	let del = useDeleteResources();
	let newResource = $state({
		title: 'adasdasd',
		description: 'asdasdasdas',
		link: 'https://www.google.com',
		room_id: chatStore.selectedChat?.room_id,
		user_id: user.id
	});
	let resources = [
		{
			id: 1,
			title: 'Character Development Guide',
			link: 'https://example.com/character-guide',
			description: 'A comprehensive guide to developing complex characters.'
		},
		{
			id: 2,
			title: 'World-Building Techniques',
			link: 'https://example.com/world-building',
			description: 'Tips and tricks for creating immersive fictional worlds.'
		},
		{
			id: 3,
			title: 'Plot Structure Templates',
			link: 'https://example.com/plot-templates',
			description:
				'Various plot structure templates to help outline your novel.'
		}
	];
	const handleInputChange = (e) => {};
	const handelRemove = (d: chatResource) => {
		del.mutate(
			{ ...d, delete_all: false },
			{
				onSuccess: () => {
					data.refetch();
				}
			}
		);
	};

	const handleShare = () => {
		add.mutate(
			{ ...newResource, room_id: chatStore.selectedChat?.room_id },
			{
				onSuccess: () => {
					data.refetch();
				}
			}
		);
	};
	import { fade, fly } from 'svelte/transition';

	const currRoomUser = $derived(chatStore.wsRoomInfo?.users.get(user.id));
</script>

<Drawer
	title="Resources"
	description="sharing any tips/tricks for writing! Max 100 resources"
	bind:open={openState.openResource}
>
	{#snippet children()}
		<div>
			<ScrollArea
				class="h-[300px] pr-4 border-b-2 border-lime p-1 shadow-cyan-300"
			>
				{#each data.data || [] as resource (resource.id)}
					{@const poster = chatStore.wsRoomInfo?.users.get(resource.user_id)}
					<div
						class="mb-4 p-4 bg-white rounded-lg shadow-sm"
						out:fade
						in:fade={{ duration: 200 }}
					>
						<h3
							class="text-lg font-semibold font-serif flex items-center gap-2"
						>
							<Book class="h-5 w-5 text-emerald-600" />
							{resource.title}
						</h3>
						<a
							href={resource.link}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-emerald-600 hover:underline flex items-center gap-1 mt-1"
						>
							<Link class="h-4 w-4" />
							{resource.link}
						</a>
						<p class="text-sm text-stone-600 mt-2">
							{resource.description}
						</p>
						<div class="flex justify-end">
							{#if user.id == resource.user_id || currRoomUser?.role == 'admin' || currRoomUser?.role == 'moderator'}
								<button onclick={() => handelRemove(resource)} class="">
									<X />
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</ScrollArea>
		</div>
		<hr />
		<h3 class="text-lg font-semibold font-serif">Add New Resource</h3>
		<div class="space-y-2">
			<Label for="title">Title</Label>
			<Input
				autocomplete="off"
				id="title"
				name="title"
				bind:value={newResource.title}
				onChange={handleInputChange}
				placeholder="e.g., Writing Prompts Collection"
				class="bg-stone-50"
			/>
		</div>
		<div class="space-y-2">
			<Label for="link">Link</Label>
			<Input
				autocomplete="off"
				id="link"
				name="link"
				bind:value={newResource.link}
				placeholder="https://example.com/resource"
				class="bg-stone-50"
			/>
		</div>
		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Textarea
				autocomplete="off"
				id="description"
				name="description"
				bind:value={newResource.description}
				placeholder="A brief description of the resource..."
				class="bg-stone-50"
			/>
		</div>
		<Button
			onclick={handleShare}
			class="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
		>
			<Plus class="h-4 w-4 mr-2" /> Add Resource
		</Button>
	{/snippet}
</Drawer>
