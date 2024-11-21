<script lang="ts">
	import useUpload from '$lib/queries/storage/useUpload';
	import { type Snippet } from 'svelte';
	import { default as Button } from './button.svelte';
	import { user } from '$lib/state/runes.svelte';
	import Avatar from './avatar.svelte';
	import type { uploadType } from '$lib/queries/storage/constants';
	let {
		imageType = 'avatar',
		accept = 'image/*',
		displayPreview,
		uploadUI = true,
		fileArray = $bindable([]),
		files = $bindable([]),
		multiple = false,
		isLoading,
		initURL,
		children,
		onPreviewURLChange = () => {},
		PreviewImage,
		onUpload
	}: {
		uploadUI?: boolean;
		fileArray?: File[];
		files?: File[];
		multiple?: boolean;
		accept?: string;
		imageType?: uploadType;
		isLoading?: boolean;
		displayPreview?: boolean;
		onUpload?: (files: File[]) => unknown;
		children?: Snippet;
		PreviewImage?: Snippet<[string]>;
		initURL?: string | null; // initial preview url i.e user avatar
		onPreviewURLChange?: (v?: string | null) => void;
	} = $props();

	let store = $state<File[]>([]);

	$effect(() => {
		fileArray = Array.from(store);
		files = Array.from(store);
	});

	const upload = useUpload(imageType);
	let previewURL = $derived(
		store?.length == 1 && store[0] ? URL.createObjectURL(store[0]) : initURL
	);
	$effect(() => {
		onPreviewURLChange(previewURL);
	});
</script>

<div class="flex items-center justify-center w-full flex-col">
	<!-- preview -->

	<div class="mb-2 rounded" class:hidden={!displayPreview}>
		{#if previewURL}
			{@render PreviewImage?.(previewURL)}
			{#if !PreviewImage}
				<Avatar
					user={{ ...user, avatar_url: previewURL }}
					src={previewURL}
					size="lg"
				/>
			{/if}
		{/if}
	</div>

	<label
		for="dropzone-file"
		class="flex flex-col items-center justify-center w-full min-h-34 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<svg
				class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 20 16"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
				/>
			</svg>
			{#if store?.length >= 1}
				<span class="hover:opacity-50" class:hidden={store.length > 1}>
					<button
						class="max-w-[16rem] truncate"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							store = [];
						}}
					>
						{store?.[0]?.name}
					</button>
				</span>
				<Button
					class="bg-amber rounded-lg p-1 {uploadUI ? '' : 'hidden'}"
					onclick={() => {
						onUpload?.(store);
					}}
					{isLoading}
				>
					Upload
				</Button>
			{/if}
			<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
				<span class="font-semibold">Click to upload</span>
				<!-- or drag and drop -->
			</p>
			<p
				class="text-xs text-gray-500 dark:text-gray-400"
				class:hidden={files?.length == 1}
			>
				SVG, PNG, JPG or GIF (MAX.5MB)
			</p>
		</div>
		<!-- 	<div id="fileUploader" class="dropzone" use:init></div> -->
		<input
			id="dropzone-file"
			class="hidden"
			type="file"
			{accept}
			onchange={(e) => {
				if (e.target) {
					//@ts-ignore
					store = e.target.files;
				}
			}}
			size="1"
			{multiple}
		/>
	</label>
</div>

<style>
</style>
