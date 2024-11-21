<script module>
	import 'quill/dist/quill.snow.css';
	import { debounce } from 'lodash-es';
	import hljs from 'highlight.js';
	import { onDestroy, onMount } from 'svelte';
	import { type default as Quill } from 'quill';
	let id = 0;
	/**
	 * 将html字符串转成delta
	 * @param {*} html
	 * @returns delta json
	 */
	function htmlToDelta(html: string, Quill: Quill) {
		const div = document.createElement('div');
		div.setAttribute('id', 'htmlToDelta');
		div.innerHTML = `<div id="quillEditor" style="display:none">${html}</div>`;
		document.body.appendChild(div);
		const quill = new Quill('#quillEditor', {
			syntax: { hljs },
			theme: 'snow'
		});
		const delta = quill.getContents();
		document.getElementById('htmlToDelta').remove();
		return delta;
	}
</script>

<script lang="ts">
	let {
		onchange,
		debounceInput = true,
		value = $bindable(),
		placeholder,
		initialHTML, // use value
		maxLength = 1000,
		type = 'limited'
	}: {
		onchange?: (s: string) => unknown;
		value: string;
		debounceInput: boolean;
		initialHTML?: string;
		placeholder?: string;
		maxLength?: number;
		type: 'limited' | 'full';
	} = $props();
	id += 1;
	let editor_id = 'quill' + id;
	const toolbarOptions = [
		['bold', 'italic', 'underline', 'strike'], // toggled buttons
		['blockquote', 'code-block'],
		type == 'limited'
			? ['link', 'formula']
			: ['link', 'image', 'video', 'formula'],

		[{ header: 1 }, { header: 2 }], // custom button values
		[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
		[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
		[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
		[{ direction: 'rtl' }], // text direction

		[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
		[{ header: [1, 2, 3, 4, 5, 6, false] }],

		[{ color: [] }, { background: [] }], // dropdown with defaults from theme
		[{ font: [] }],
		[{ align: [] }],

		['clean'] // remove formatting button
	];
	const change = (html: string) => {
		onchange?.(html);
		value = html;
	};
	let msg = $state();
	let el: HTMLElement = $state();
	let quill = $state();
	async function getQuill() {
		const quill = (await import('quill')).default;
		return initEditor(el, quill);
	}

	onMount(() => {
		if (el) {
			return getQuill();
		} else {
			msg = 'failed to find editor on mount';
		}
	});

	const deb = debounce(change, 500);
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
	function initEditor(node: HTMLElement, Quill) {
		const quill = new Quill(node, {
			modules: {
				syntax: { hljs },
				toolbar: toolbarOptions
			},
			theme: 'snow',
			placeholder: placeholder
		});
		if (value || initialHTML)
			quill.setContents(htmlToDelta(initialHTML ?? value, Quill), 'api');
		quill.on('text-change', (delta, oldDelta, source) => {
			let html = quill.getSemanticHTML();
			if (maxLength && maxLength > 0) {
				const length = quill.getLength();
				if (maxLength < length) {
					//debugger;
					//	const toDel = Math.min(maxLength - length, 0);
					//delta.delete(length - maxLength);
					quill.deleteText(maxLength, 1);
					return;
				}
			}
			console.log(html);

			if (debounceInput) {
				deb(html);
			} else {
				value = html;
				onchange?.(html);
			}
		});

		return () => destroy_quill(quill, node);
	}
</script>

{#if !el}
	Loading Editor... {msg}
{/if}

<div id={editor_id} class="h-fit" bind:this={el}></div>
