<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { Snippet } from 'svelte';
	let {
		...props
	}: {
		text: string;
		class: string;
		el?: 'button' | 'span' | 'p';
		el_text?: string;
		trigger: Snippet<[{ props: object }]>;
	} = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger
			class={props.class != null
				? props.class
				: buttonVariants({ variant: 'outline' })}
		>
			{#snippet child({ props: args })}
				{@render props.trigger?.({ props: args })}
				{#if !props.trigger}
					<svelte:element this={props.el} {...args}>
						{props.el_text}
					</svelte:element>
				{/if}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{props.text}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
