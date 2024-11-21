<script lang="ts">
	import {
		Popover,
		PopoverTrigger,
		PopoverContent
	} from '$lib/components/ui/popover';
	import * as Drawer from '$lib/components/ui/drawer';
	import { useMediaQuery } from '$lib/utils/mediaQuery.svelte';
	import type { Snippet } from 'svelte';
	type p = {
		open?: boolean;
		button?: Snippet<[any]>;
		children?: Snippet;
		footer?: Snippet;
		title?: string;
		class?: string;
		desc?: string;
		closeOnOutside?: boolean;
	};
	let {
		closeOnOutside = true,
		children,
		button,
		open = $bindable(false),
		footer,
		class: cls,
		...props
	}: p = $props();
	const isDesktop = useMediaQuery('(min-width: 768px)');
</script>

{#if isDesktop.match}
	<Popover bind:open>
		<PopoverTrigger>
			{#snippet child({ props })}
				{#if button}
					{@render button(props)}
				{:else}
					<button class="hidden" {...props}>
						placeholder button for popover
					</button>
				{/if}
			{/snippet}
		</PopoverTrigger>
		<PopoverContent
			class="w-80 {cls}"
			interactOutsideBehavior={closeOnOutside ? undefined : 'ignore'}
		>
			{@render children?.()}
		</PopoverContent>
	</Popover>
{/if}
{#if isDesktop.match === false}
	<Drawer.Root bind:open>
		<Drawer.Trigger>
			{#snippet child({ props })}
				{@render button?.({ props })}
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<div class="mx-auto w-full max-w-sm {cls}">
				<Drawer.Header>
					<Drawer.Title>{props.title}</Drawer.Title>
					<Drawer.Description>{props.desc}</Drawer.Description>
				</Drawer.Header>
				{@render children?.()}
				<Drawer.Footer>
					{#if footer}
						{@render footer()}
					{/if}
					<Drawer.Close>Close</Drawer.Close>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
