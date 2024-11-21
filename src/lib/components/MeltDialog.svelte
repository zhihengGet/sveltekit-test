<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	/** Internal helpers */
	import { cn, flyAndScale } from '$lib/utils/index';
	import { X } from '$lib/icons';
	import { fade } from 'svelte/transition';
	const {
		elements: {
			trigger,
			overlay,
			content,
			title,
			description,
			close,
			portalled
		},
		states: { open: openState }
	} = createDialog({
		forceVisible: true,
		portal: document.body,
		defaultOpen: false,
		closeOnOutsideClick: false
	});
	let classes = '';
	export { classes as class };
	export let text = '';
	export let title_text = '';
	export let description_text = '';
</script>

<slot name="init" builder={trigger}>
	<button
		use:melt={$trigger}
		class="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3
	    font-medium leading-none text-magnum-700 shadow hover:opacity-75"
	>
		{text}
	</button>
</slot>
<div use:melt={$portalled}>
	{#if $openState}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			class={cn(
				'fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg',
				classes
			)}
			transition:flyAndScale={{
				duration: 150,
				y: 8,
				start: 0.96
			}}
			use:melt={$content}
		>
			<h2 use:melt={$title} class="m-0 text-lg font-medium text-black">
				{title_text}
			</h2>
			<p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
				{description_text}
			</p>

			<slot name="content" />

			<div class="mt-6 flex justify-end gap-4">
				<slot
					name="footer"
					close={() => {
						$openState = false;
					}}
				/>
			</div>
			<button
				use:melt={$close}
				aria-label="close"
				class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                  items-center justify-center rounded-full p-1 text-magnum-800
                  hover:bg-magnum-100 focus:shadow-magnum-400"
			>
				<X class="square-4" />
			</button>
		</div>
	{/if}
</div>
