<script lang="ts">
	let { status } = $props();
	/* temp status not persisted */
	let statusToColor = {
		online: 'Chartreuse',
		disconnected: 'gray',
		error: 'red',
		connecting: 'yellow'
	};
</script>

<div
	class={`h-2 w-2 inline-block rounded-full mx-1`}
	style="background:{statusToColor[status] ?? '#FAEBD7'}"
></div>
