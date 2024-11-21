<script lang="ts">
	import {
		EditorBase,
		type Settings,
		createHistoryContext,
		SettingsContext,
		LexicalComposer,
		SharedAutocompleteContext
	} from 'lexical-svelte-runes/editor';
	import { ToolbarContext } from 'lexical-svelte-runes/playground/plugins/ToolbarPlugin/ToolbarContext.svelte.js';
	import 'lexical-svelte-runes/index.css';
	let { editor = $bindable(), ...props }: Settings & { editor: any } = $props();
	createHistoryContext();
	ToolbarContext();
</script>

<SettingsContext settings={props}>
	<SharedAutocompleteContext>
		<LexicalComposer bind:bindEditor={editor}>
			<div class="editor-shell w-full">
				<EditorBase />
			</div>
		</LexicalComposer>
	</SharedAutocompleteContext>
</SettingsContext>
