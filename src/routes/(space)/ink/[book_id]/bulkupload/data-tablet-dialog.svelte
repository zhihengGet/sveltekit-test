<script>
	import Dialog from '$lib/components/Drawer.svelte';
	import { InkStore } from '../../../store.svelte';

	import DataTable from './data-table.svelte';
</script>

<Dialog
	description="Mass Upload Your Work !"
	bind:open={InkStore.bulkUpload}
	title="Bulk Upload"
	class="sm:max-w-[1000px]"
>
	<DataTable />
</Dialog>
