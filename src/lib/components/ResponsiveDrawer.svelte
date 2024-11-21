<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { isMobile } from '$lib/utils/isMobile';
	import type { Snippet } from 'svelte';
	/* 
You can combine the Dialog and Drawer components to create a responsive dialog. This renders a Dialog on desktop and a Drawer on mobile.
     */
	let { open, title, description, trigger, body } = $props<{
		open: boolean;
		body: Snippet;
		trigger?: Snippet<{ builder: any }>;
		description: string;
		title: string;
	}>();
	const isMob = isMobile();
</script>

<!-- Desktop dialog -->

{#if isMob() == false}
	<Dialog.Root bind:open>
		<Dialog.Trigger asChild let:builder>
			{#if trigger}
				{@render trigger({ builder })}
			{:else}
				<Button variant="outline" builders={[builder]}>Edit Profile</Button>
			{/if}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px] hidden md:flex">
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>
					{description}
				</Dialog.Description>
			</Dialog.Header>
			{@render body()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<!-- Mobile dialog -->
	<Drawer.Root bind:open>
		<Drawer.Trigger asChild let:builder>
			<Button variant="outline" builders={[builder]}>Edit Profile</Button>
		</Drawer.Trigger>
		<Drawer.Content class="flex md:hidden">
			<Drawer.Header class="text-left">
				<Drawer.Title>Edit profile</Drawer.Title>
				<Drawer.Description>
					Make changes to your profile here. Click save when you're done.
				</Drawer.Description>
			</Drawer.Header>
			<form class="grid items-start gap-4 px-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input type="email" id="email" value="shadcn@example.com" />
				</div>
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input id="username" value="@shadcn" />
				</div>
				<Button type="submit">Save changes</Button>
			</form>
			<Drawer.Footer class="pt-2">
				<Drawer.Close asChild let:builder>
					<Button variant="outline" builders={[builder]}>Cancel</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
