<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { Footer } from './ui/alert-dialog';
	export const leftAction = '';
	export const rightAction = '';

	interface Props {
		title?: string;
		desc?: string;
		open?: boolean;
		innerClass?: boolean;
		class?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		children,
		footer,
		title = '',
		desc = '',
		open = $bindable(true),
		innerClass = false,
		class: classes = ''
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class={twMerge(
			'overflow-hidden max-w-screen max-h-[500px] max-h-[90vh] z-51 w-[500px] p-[1rem] ',
			classes
		)}
	>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{desc}
			</Dialog.Description>
		</Dialog.Header>
		<div class="overflow-auto max-h-100% p-3.5px">
			{@render children?.()}
		</div>
		<Dialog.Footer>
			{@render footer?.()}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
