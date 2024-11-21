<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar';
	import PreviewGenerator from '$lib/composite/PreviewGenerator.svelte';
	import { log_out } from '$lib/queries';
	import { InkStore } from './store.svelte';

	const sharedWith = $state('');
</script>

<PreviewGenerator
	bind:open={InkStore.preview.open}
	book_id={InkStore.book.id}
	initBook={InkStore.book}
	initChapter={InkStore.chapter}
/>
<Menubar.Root class={InkStore.focus ? 'opacity-20 hover:opacity-100' : ''}>
	<Menubar.Menu>
		<Menubar.Trigger>Chapters</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item
				onclick={() => {
					InkStore.openChapterSheet = true;
				}}
			>
				Edit Chapters <!-- <Menubar.Shortcut>⌘T</Menubar.Shortcut> -->
			</Menubar.Item>
			<!-- 	<Menubar.Item
				onclick={() => {
					InkStore.preview.open = true;
				}}
			>
				Previews
			</Menubar.Item> -->
			<Menubar.Separator />
			<Menubar.Item
				onclick={() => {
					//InkStore.openChapterSheet = true;
					InkStore.openCreateDialog = true;
				}}
			>
				New Chapter <!-- <Menubar.Shortcut>⌘N</Menubar.Shortcut> -->
			</Menubar.Item>
			<Menubar.Item
				onclick={() => {
					InkStore.bulkUpload = true;
				}}
			>
				Bulk Upload
			</Menubar.Item>
			<Menubar.Separator />
			<!-- 		<Menubar.Sub>
				<Menubar.SubTrigger disabled={true} class="opacity-30">
					Share
				</Menubar.SubTrigger>
				<Menubar.SubContent>
					<Menubar.Item disabled={true}>Email link</Menubar.Item>
					<Menubar.Item disabled={true}>Messages</Menubar.Item>
					<Menubar.Item disabled={true}>Notes</Menubar.Item>
				</Menubar.SubContent>
			</Menubar.Sub> -->
			<Menubar.Separator />
			<Menubar.Item disabled={true}>
				Print... <Menubar.Shortcut>⌘P</Menubar.Shortcut>
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Previews</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item
				onclick={() => {
					InkStore.preview.open = true;
				}}
			>
				Manage
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger class="hidden">Theme</Menubar.Trigger>
		<Menubar.Content class="hidden">
			<Menubar.Item>
				Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item>
				Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Sub>
				<Menubar.SubTrigger>Find</Menubar.SubTrigger>
				<Menubar.SubContent>
					<Menubar.Item>Search the web</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Find...</Menubar.Item>
					<Menubar.Item>Find Next</Menubar.Item>
					<Menubar.Item>Find Previous</Menubar.Item>
				</Menubar.SubContent>
			</Menubar.Sub>
			<Menubar.Separator />
			<Menubar.Item>Cut</Menubar.Item>
			<Menubar.Item>Copy</Menubar.Item>
			<Menubar.Item>Paste</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Editor Settings</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.CheckboxItem
				onclick={() => {
					InkStore.focus = !InkStore.focus;
				}}
			>
				Focus Mode <!-- {InkStore.focus ? '🍴' : '✍'} -->
			</Menubar.CheckboxItem>
			<!-- 	<Menubar.CheckboxItem bind:checked={fullUrls}>
				Toolbar
			</Menubar.CheckboxItem>
			<Menubar.Separator />
			<Menubar.Item inset>
				Auto Save <Menubar.Shortcut>⌘R</Menubar.Shortcut>
			</Menubar.Item> -->
			<Menubar.Item
				inset
				onclick={() => {
					InkStore.openAutocomplete = true;
				}}
			>
				Word Bank <Menubar.Shortcut></Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item
				inset
				onclick={() => {
					InkStore.enableAutocomplete = !InkStore.enableAutocomplete;
				}}
			>
				Autocomplete -- {InkStore.enableAutocomplete
					? 'On'
					: 'Off'}<Menubar.Shortcut></Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Separator />
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger disabled={true} class="opacity-60">Share</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.RadioGroup value={sharedWith}>
				<Menubar.Item disabled={true}>Email link</Menubar.Item>
				<Menubar.Item disabled={true}>Messages</Menubar.Item>
				<Menubar.Item disabled={true}>Notes</Menubar.Item>
			</Menubar.RadioGroup>
			<Menubar.Separator />
			<Menubar.Item inset>Edit...</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item inset>Add Profile...</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger onclick={() => log_out()}>Log Out</Menubar.Trigger>
	</Menubar.Menu>
</Menubar.Root>
