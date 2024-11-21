<script lang="ts">
	import type { Cell } from '@tanstack/table-core';
	import type { dataType, metaType } from '.';
	import { createEventDispatcher, mount } from 'svelte';
	import { debounce, throttle } from 'lodash-es';
	import Status from './status.svelte';
	//	export let cell: Cell<dataType, any>;

	let { cell }: { cell: Cell<dataType, any> } = $props();
	let value = $state(cell.getValue()); //take initial value then we're on our own , will not reRender
	let dispatch = createEventDispatcher<{ update: string; click: File }>();

	const meta = $derived(cell.column.columnDef.meta) as metaType;
	const isEditable = $derived(!!meta.editable);

	const throttled = debounce(dispatch, 500);

	const v = $derived(cell.column.columnDef.cell(cell.getContext()));
	$effect(() => {
		value = v; // update input value when cell rerender ?
	});
	$effect(() => {
		console.log('cell rendered 1', value, cell.row.original.uploadStatus);
		console.log(
			'cell rendered 2',
			cell.column.columnDef.cell(cell.getContext())
		);
	});
	cell.column.columnDef.id;
</script>

<input
	{value}
	disabled={cell.row.original.uploadStatus != 'validity'}
	class="max-w-full w-fit"
	oninput={(e) => {
		if (e.target?.value) {
			value = e.target.value;
			throttled('update', value);
		}
	}}
	class:hidden={isEditable == false}
/>
<!-- <svelte:component
this={flexRender(cell.column.columnDef.cell, cell.getContext())}
></svelte:component> -->
{#if cell.column.columnDef.id == 'errors'}
	<details>
		<summary>Error</summary>
		<b class="text-red-600">
			{v}
		</b>
	</details>
{/if}
{#if cell.column.columnDef.id !== 'errors'}
	{@render Button()}
{/if}
{#snippet Button()}
	<button
		class:hidden={isEditable == true || cell.column.columnDef.id == 'errors'}
		class="max-w-full overflow-hidden text-ellipsis"
		onclick={() => {
			dispatch('click', cell.row.original.file);
			meta.click ? meta.click(cell.row.original) : '';
		}}
	>
		{#if typeof v == 'string'}
			{v}
		{:else}
			<Status uploadStatus={cell.row.original.uploadStatus} />
		{/if}
	</button>
{/snippet}
