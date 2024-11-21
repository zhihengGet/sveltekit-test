<script lang="ts">
	import Text from '$components/text.svelte';
	//import 'lexical-svelte-runes/index.css';
	import 'lexical-svelte-runes/../src/themes/PlaygroundEditorTheme.css';
	interface Props {
		html?: string | null;
		class?: string;
		style?: string;
	}

	let {
		html = '<p>empty</p>',
		class: classes = '',
		style = ''
	}: Props = $props();
</script>

<Text html={html ?? ''} el="article" class={classes} {style} />
