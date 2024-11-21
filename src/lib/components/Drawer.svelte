<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { useMediaQuery } from '$lib/utils/mediaQuery.svelte';
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	const isDesktop = useMediaQuery('(min-width: 768px)');
	let {
		title,
		description,
		children,
		trigger,
		open = $bindable(false),
		footer,
		class: classes = '',
		direction = 'bottom',
		openFocus = false,
		style,
		Overlay,
		...props
	}: {
		title: string;
		openFocus?: boolean;
		open: boolean;
		description: string;
		children?: Snippet;
		class?: string;
		direction?: 'bottom' | 'left' | 'right' | 'top';
		trigger?: Snippet<[{ props: object }]>;
		footer?: Snippet;
		style?: string;
		Overlay?: Snippet;
	} = $props();
</script>

{#if isDesktop.match}
	<Dialog.Root bind:open {...props}>
		<Dialog.Trigger>
			{#snippet child({ props })}
				{@render trigger?.({ props })}
			{/snippet}
		</Dialog.Trigger>
		{@render Overlay?.()}
		<!-- 		<Dialog.Overlay></Dialog.Overlay> -->
		<Dialog.Content
			class={twMerge('sm:max-w-[425px] max-h-8/10 overflow-auto', classes)}
			{style}
		>
			<Dialog.Header>
				<Dialog.Title {style}>{title}</Dialog.Title>
				<Dialog.Description>
					{description}
				</Dialog.Description>
			</Dialog.Header>
			{@render children?.()}
			<Dialog.Footer>
				{@render footer?.()}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open {direction} {...props}>
		<Drawer.Trigger>
			{#snippet child({ props })}
				{@render trigger?.(props)}
			{/snippet}
		</Drawer.Trigger>
		{@render Overlay?.()}
		<!-- 	<Drawer.Overlay class="fixed inset-0 bg-black/40" /> -->
		<Drawer.Content class={twMerge('lg:max-w-[425px] ', classes)} {style}>
			<Drawer.Header class="text-left">
				<Drawer.Title>{title}</Drawer.Title>
				<Drawer.Description>
					{description}
				</Drawer.Description>
			</Drawer.Header>

			{@render children?.()}

			<Drawer.Footer>
				<span class="flex justify-center gap-2">
					<Drawer.Close>Close</Drawer.Close>
					{@render footer?.()}
				</span>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
