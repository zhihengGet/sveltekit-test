<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		onClick,
		icon,
		text,
		iconSnippet,
		isEnabled = true
	}: {
		onClick?: MouseEventHandler<HTMLButtonElement>;
		icon?: Component<any>;
		text?: string;
		iconSnippet?: Snippet<[{ class: string }]>;
		isEnabled?: boolean;
	} = $props();
</script>

{#snippet Icon({ class: className })}
	{#if icon}
		<svelte:component this={icon} size={20} />
	{/if}
	{#if iconSnippet}
		{@render iconSnippet({ class: className })}
	{/if}
{/snippet}
{#if !text}
	<button
		disabled={!isEnabled}
		onclick={onClick}
		class:opacity-50={!isEnabled}
		class="w-fit flex items-center border-1 border-gray-100 p-1 rounded-full h-10 justify-center"
	>
		{@render Icon({ class: 'w-[20px]' })}
	</button>
{/if}
{#if text}
	<button
		disabled={!isEnabled}
		onclick={onClick}
		class:opacity-50={!isEnabled}
		class="w-full flex items-center border-neutral border-1 rounded-2xl p-2 h-10 mb-1"
	>
		{@render Icon()}

		<p class="text-center w-full text-sm font-light">{text}</p>
	</button>
{/if}
