<!-- <script lang="ts">
	import FileUpload from '$components/FileUpload.svelte';
	import useUpload from '$lib/queries/storage/useUpload';
	import { userStore } from '$lib/state/store';

	let files: FileList | [] = [];
	let shouldUpload = false;
	export let type: Parameters<typeof useUpload>[number] = 'avatar';
	$: console.log(files);

	const upload = useUpload(type);
</script>

{$userStore.avatar_url}
<label for="upload">upload</label>
<input type="file" id="upload" accept="image/*" bind:files />
<button
	onclick={() => {
		if (files.length == 1)
			$upload.mutate({ uid: $userStore.id, file: files[0] });
	}}
	type="button"
>
	upload {$upload.status}
</button> -->
