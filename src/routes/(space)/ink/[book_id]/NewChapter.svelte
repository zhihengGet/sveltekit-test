<script lang="ts">
	import Dialog from '$components/dialog.svelte';
	import ChapterForm from './ChapterForm.svelte';
	import { InkStore } from '../../store.svelte';
</script>

<Dialog
	title="Create Chapters"
	class="max-9/10 md:w-[396px]"
	desc={InkStore.book?.title}
	bind:open={InkStore.openCreateDialog}
>
	<ChapterForm showDescription={true} isNewChapter={true} />
</Dialog>
