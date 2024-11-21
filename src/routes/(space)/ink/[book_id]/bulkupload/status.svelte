<script lang="ts">
	import { bulk_file_status } from '.';

	//	export let status: keyof typeof bulk_file_status | null = null;

	let { uploadStatus }: { uploadStatus: keyof typeof bulk_file_status } =
		$props();

	$effect(() => {
		console.log('status update', uploadStatus);
	});
	const colorPicker = bulk_file_status;
</script>

<!-- markup (zero or more items) goes here -->

<div
	class="border-1 dot bg-red w-20"
	style="--status:{colorPicker[uploadStatus]}"
></div>

<style>
	/* your styles go here */
	.dot {
		height: 20px;
		width: 20px;
		background-color: var(--status);
		border-radius: 50%;
		display: inline-block;
	}
</style>
