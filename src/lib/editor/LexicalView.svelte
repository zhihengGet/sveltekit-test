<script lang="ts">
	import { OvalSpinner } from '$lib/icons';
	import ChatIcon from '$lib/icons/chat/ChatIcon.svelte';
	import type { Settings } from 'lexical-svelte-runes/editor';
	import { START_COMMENT_NODE, lexical } from 'lexical-svelte-runes/editor';
	import { onMount, type Component } from 'svelte';
	import './view.css';
	import { afterNavigate } from '$app/navigation';
	let {
		...props
	}: Partial<Settings> & {
		comment: (id: string, paragraphContent: string) => void;
		init: Function;
	} = $props();
	let editor: lexical.LexicalEditor | null = $state(null);
	let EditorInstance = $state();
	let Awaited: Component<Settings> | undefined = $state();
	onMount(() => {
		EditorInstance = import('./editor.svelte').then((v) => {
			Awaited = v.default;
		});
	});
	function show() {
		console.log(
			'dispatched',
			editor?.dispatchCommand(START_COMMENT_NODE, null)
		);
	}
	$effect(() => {
		if (EditorInstance && editor) {
			setTimeout(() => {
				editor?._observer?.disconnect();
				props.init(editor?.getRootElement());
			}, 1000);
		}
	});

	afterNavigate(() => {
		editor?._observer?.disconnect();
		if (editor) props.init(editor?.getRootElement());
	});
	// get all section_ids

	//when we click next button, need to show again
	async function handleClick(id: { id: string; paragraphContent: string }) {
		props.comment(id.id, id.paragraphContent);
	}

	$inspect('data', props);
</script>

<div class="editor-container-shell">
	{#if EditorInstance}
		{#await EditorInstance}
			<OvalSpinner />
		{:then}
			<Awaited
				bind:editor
				isCharLimitUtf8={false}
				isMaxLength={false}
				isAutocomplete={false}
				paragraphComment={false}
				dev={false}
				config={{ editable: false }}
				showToolbar={false}
				initialHTML={props.initialHTML}
			/>
		{/await}
	{/if}
</div>

<div class="render-lexical"></div>

<style>
	/* 	:global(.editor-container-shell) {
		--lexcial-headers: inherit;
		--lexcial-text: var(--reader-color);
		--lexcial-container-bg: var(--reader-backgroundColor);
		--lexical-collapsible-container: var(--reader-backgroundColor);
		--lexical-collapsible-title: #123123;
		--lexical-page-break-bg: #123123;
		--lexical-page-break: #509777;
		--lexical-code-filter-invert: var(--reader-darken);
		--lexical-collapsible-filter-invert: var(--reader-darken);
	}
	:global(.editor-container p) {
		color: var(--lexcial-text) !important;
	}
	:global(.editor-container) {
		background-color: var(--lexcial-container-bg) !important;
		color: antiquewhite !important;
	}
	:global(.editor-container code) {
		filter: var(--lexical-code-filter-invert);
	}
	:global(.editor-container) {
		:global(div, p, span) {
			color: var(--lexcial-text) !important;
		}
		:global(h1, h2, h3, h4, h5, h6) {
			color: var(--lexcial-headers) !important;
		}
		:global(h1, h2, h3, h4, h5, h6) {
			:global(span) {
				color: var(--lexcial-headers) !important;
			}
		}
		:global(.Collapsible__container) {
			filter: var(--lexical-collapsible-filter-invert);
		}
		:global(.Collapsible__title) {
			filter: var(--lexical-collapsible-filter-invert);
		}
		:global([type='page-break']) {
			background-color: var(--lexical-page-break-bg) !important;
			color: var(--lexical-page-break) !important;
		}
		:global([type='page-break']::after) {
			filter: var(--lexical-code-filter-invert);
		}
	} */
</style>
