<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Component, Snippet, SvelteComponent } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { buttonVariants } from './ui/button';

	type one = {
		rightIcon?: Component<any>;
		str: string;
		leftIcon?: SvelteComponent<any> | null;
		onClick: any;
		disabled?: boolean;
	};
	interface Props {
		items: { [s in string]: one[] };
		title?: string;
		buttonString?: string;
		class?: string;
		content?: import('svelte').Snippet;
		shortcut?: import('svelte').Snippet;
		children?: Snippet;
		button?: Snippet;
	}
	let selected: one | undefined = $state();
	let {
		items,
		title = '',
		buttonString = '',
		class: classes = '',
		content,
		shortcut,
		children,
		button
	}: Props = $props();

	function getItem(key: string) {
		return items[key] as one[];
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		type="reset"
		tabindex={100}
		class={buttonVariants({ variant: 'outline' })}
	>
		<!-- {#snippet child({ props })}
			{#if button}
				{@render button({ props })}
			{/if}
		{/snippet} -->

		{buttonString}:{selected?.str}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class={twMerge('h-[200px] overflow-auto z-52', classes)}
	>
		{@render content?.()}
		{@render children?.()}
		{#each Object.keys(items) as group}
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>{title}</DropdownMenu.GroupHeading>
				<DropdownMenu.Separator />
				{#each getItem(group) as item}
					<DropdownMenu.Item
						onSelect={() => {
							item.onClick(item);
							selected = item;
						}}
						disabled={item.disabled || false}
					>
						{#if item.rightIcon}
							<item.rightIcon />
						{/if}

						<span>{item.str}</span>
						<DropdownMenu.Shortcut>
							{@render shortcut?.()}
						</DropdownMenu.Shortcut>
					</DropdownMenu.Item>{/each}
			</DropdownMenu.Group>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
