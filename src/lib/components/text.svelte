<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import clip from 'text-clipper';
	let {
		enableMore = false,
		text = '',
		html = '',
		wordLimit = 200,
		el = 'span',
		class: classes,
		children,
		...props
	}: {
		enableMore?: boolean;
		text?: string;
		html?: string;
		wordLimit?: number;
		children?: Snippet;
		style?: string;
		el?:
			| 'a'
			| 'div'
			| 'span'
			| 'em'
			| 'button'
			| 'p'
			| 'h1'
			| 'h2'
			| 'h3'
			| 'input'
			| 'article'
			| 'textarea';
		class: string;
	} = $props();

	let show = $state(text.length <= wordLimit);
	let showMoreButton = $derived(enableMore && text.length > wordLimit);
	function toggle() {
		if (showMoreButton === false) {
			return text;
		} else {
			return text.substring(0, wordLimit) + '...';
		}
	}

	function toggleHTML(): string {
		if (showMoreButton === false || typeof window == 'undefined') {
			return html;
		} else {
			return clip(html, wordLimit);
		}
	}

	let displayHTML = $derived(toggleHTML());
	let displayText = $derived(toggle());
	let outputHTML = $derived(!show ? displayHTML : html);
	let output = $derived(!show ? displayText : text);
	let o = $derived(output || outputHTML);
	let isInput = $derived(el == 'input' || el == 'textarea');
	let component: Element = $state();
	//@html is not reactive somehow with page.data
	/* 	$effect(() => {
		if (outputHTML) {
			component.innerHTML = outputHTML;
		}
	}); */
</script>

<!-- 
 + (html.length > 0 && enableMore
				? 'inline-block overflow-y-hidden  text-ellipsis h-18 book_sizing_sm' // if use innerHTML,we want to limit the length
				: '')

 -->
<svelte:element
	this={el}
	contenteditable={isInput ? true : false}
	class={twMerge(classes)}
	role={isInput ? 'textbox' : null}
	tabindex={isInput ? 0 : null}
	autocorrect="off"
	autocapitalize="off"
	spellcheck="false"
	bind:this={component}
	autocomplete="off"
	{...props}
>
	{#if outputHTML}
		{@html o}
	{:else if output}
		{o}
	{/if}

	{#if showMoreButton}
		<button
			class="text-blue font-bold"
			onclick={() => {
				show = !show;
			}}
		>
			{show ? 'hide' : 'more'}
		</button>
	{/if}
	{@render children?.()}
</svelte:element>
