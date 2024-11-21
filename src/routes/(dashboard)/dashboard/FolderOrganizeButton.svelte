<script lang="ts">
	import type { book, bookWithUserInfo } from '$lib/types';
	import FolderDropdown from './FolderDropdown.svelte';
	let { book }: { book: bookWithUserInfo } = $props();
</script>

<FolderDropdown {book} text="📂Folder" type="author_folder" />
