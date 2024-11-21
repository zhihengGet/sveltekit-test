<script module lang="ts">
	import 'quill/dist/quill.snow.css';
	import type Quill from 'quill';
	import { onDestroy, onMount } from 'svelte';
	/**
	 * 将html字符串转成delta
	 * @param {*} html
	 * @returns delta json
	 */
	function htmlToDelta(html, Quill) {
		const div = document.createElement('div');
		div.setAttribute('id', 'htmlToDelta');
		div.innerHTML = `<div id="quillEditor" style="display:none">${html}</div>`;
		document.body.appendChild(div);
		const quill = new Quill('#quillEditor', {
			theme: 'snow'
		});
		const delta = quill.getContents();
		document.getElementById('htmlToDelta')?.remove();
		return delta;
	}
</script>

<script lang="ts">
	let { html }: { html: string } = $props();
	let msg = $state();
	let el: HTMLElement = $state();
	let QuillCls;
	async function getQuill() {
		const quill = (await import('quill')).default;
		QuillCls = quill;
		return initEditor(el, quill);
	}

	onMount(() => {
		if (el) {
			getQuill();
		} else {
			msg = 'failed to find editor on mount';
		}
	});

	function destroy_quill(quill: Quill, el: HTMLElement) {
		// remove toolbox
		quill.theme.modules.toolbar.container.remove();
		// remove clipboard
		quill.theme.modules.clipboard.container.remove();
		// remove tooltip
		quill.theme.tooltip.root.remove();

		// remove all unwanted classes
		el.classList.forEach((cls) => {
			if (cls.startsWith('ql-')) {
				// we use requestAnimationFrame because there's a limit to how fast browsers will run dom manipulations
				requestAnimationFrame(() => {
					el.classList.remove(cls);
				});
			}
		});

		// set inner html
		el.innerHTML = quill.root.innerHTML;
	}

	let QuillEditor: Quill | null = $state(null);
	function initEditor(node: HTMLElement, Quill) {
		const quill: Quill = new Quill(node, {
			modules: {
				toolbar: false
			},
			readOnly: true,
			theme: 'snow',
			placeholder: 'Misty'
		});

		QuillEditor = quill;
		if (html) quill.setContents(htmlToDelta(html, Quill), 'api');

		return () => destroy_quill(quill, node);
	}
	$effect(() => {
		if (QuillEditor && QuillCls && html) {
			QuillEditor.setContents(htmlToDelta(html, QuillCls));
		}
	});
</script>

{#if !el}
	Loading Editor... {msg}
{/if}

<div class="quill view h-fit" bind:this={el}></div>

<style>
	:global(.view.ql-container.ql-snow) {
		border-width: 0px !important;
	}
</style>
