<script lang="ts">
	import type {
		CellContext,
		ColumnDefTemplate,
		HeaderContext
	} from '@tanstack/table-core';
	import { mount, onDestroy, type SvelteComponent } from 'svelte';
	import type { dataType } from '.';

	let { ui, context } = $props<{
		context: CellContext<dataType, any> | HeaderContext<dataType, any>;
		ui: ColumnDefTemplate<any> | undefined;
	}>();

	function getUI(n: HTMLElement) {
		if (typeof ui !== 'function') {
			n.innerText = ui ?? '';
			return ui;
		}

		const v = ui(context);

		if (typeof v !== 'function') {
			n.innerText = v ?? '';
			return v;
		}

		const [a, destroy] = mount(v, { target: n, props: { context } });
		onDestroy(destroy);
		return '';
	}
</script>

<span use:getUI></span>
