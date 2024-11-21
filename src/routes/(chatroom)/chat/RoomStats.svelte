<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { chatStore } from './store.svelte';
	import Loader2 from 'lucide-svelte/icons/loader-2';
</script>

<Dialog.Root bind:open={chatStore.openRoomStats}>
	<!-- 	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		Edit Profile
	</Dialog.Trigger> -->
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
			<Dialog.Description>
				We're working hard to complete this page. Please check back soon!
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="flex items-center justify-center p-4">
				<Loader2 class="h-12 w-12 animate-spin text-primary" />
			</div>
			<p class="text-center text-sm text-muted-foreground">
				Our team is actively developing this feature. We appreciate your
				patience.
			</p>
		</div>
		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
