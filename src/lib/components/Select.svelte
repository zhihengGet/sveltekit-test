<script lang="ts" generics="T">
	import { flushSync, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { twMerge } from 'tailwind-merge';
	import { z } from 'zod';
	import Input from './ui/input/input.svelte';
	let {
		size = 1,
		value = $bindable(),
		disabled = false,
		class: classes = '',
		displaySelectedLabel = true,
		allowCustomOptionItems = false,
		customItems = $bindable([]),
		maxCustomItemSize = 3,
		enable_search = false,
		items = [],
		disableSearch = false,
		icon = false,
		valueType,
		onkeydown,
		isValueEqual,
		initialShow = false,
		...rest
	}: {
		size?: number;
		displaySelectedLabel?: boolean;
		icon?: boolean;
		allowCustomOptionItems?: boolean;
		customItems?: string[];
		maxCustomItemSize?: number;
		enable_search?: boolean;
		disableSearch?: boolean;
		value: string | string[];
		disabled?: boolean;
		class?: string;
		initialShow?: boolean;
		items: op[];
		valueType?: 'array' | 'string';
		onkeydown?: (e: KeyboardEvent) => unknown;
		isValueEqual?: (a: T, b: T) => boolean;
	} = $props();

	type op = { label: string; value: T };
	let selectedValue: SvelteSet<string> = new SvelteSet(value ?? []);
	let selectedItems: SvelteSet<op> = new SvelteSet([]);
	let status: 'allow_remote_sync' | 'user_update' = 'allow_remote_sync'; //skip value update when the updates is from it
	$effect(() => {
		// sync
		if (value)
			untrack(() => {
				if (status !== 'allow_remote_sync') return;
				console.log('update because remote updated');
				selectedItems.clear();
				//if (selectedItems.size == 0) {
				const selected = items.filter((v) =>
					typeof value == 'string'
						? value === v.value
						: Array.isArray(value)
							? value?.includes?.(v.value)
							: value == v.value
				);
				for (let x of selected) selectedItems.add(x);
				//	}
			});

		//console.log(items, value);
	});
	let container: HTMLElement | undefined = $state();
	let show = $state(initialShow);
	let filterInput: HTMLInputElement | undefined = $state();

	let filterText = $state('');

	const arr = $derived(Array.from(selectedItems));
	const selected_value = $derived(
		size == 1 && (!valueType || valueType == 'string')
			? arr?.[0]?.value
			: arr.map((v) => v.value)
	);
	$inspect(selected_value, 'data');
	$effect(() => {
		if (
			untrack(() => {
				return status !== 'user_update';
			}) &&
			typeof selected_value !== 'undefined'
		)
			return console.log('skip select update', status, selected_value);

		console.log('effect update ', selected_value);
		value = selected_value;
		// after user update, allow remote sync
		flushSync(() => {
			status = 'allow_remote_sync';
		});
	});
	/* $effect(() => {
		if (!isEqual(value, selected_value)) {
			untrack(() => {
				console.log(value);
				selectedItems.clear();
				const selected = items.filter((v) =>
					typeof value == 'string'
						? value === v.value
						: Array.isArray(value)
							? value?.includes?.(v.value)
							: value == v.value
				);
				for (let x of selected) selectedItems.add(x);
				flushSync();
			});
		}
	}); */

	let fiteredItem = $derived(
		items.filter((v) => {
			return (
				filterText.trim() == '' ||
				v.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1
			);
		})
	);

	function toggleDropdown() {
		if (disabled) {
			return;
		}
		show = !show;
	}

	function remove(item: op) {
		selectedValue.delete(item.value);
		selectedItems.delete(item);
		filterInput?.focus();
	}
	function add(item: op) {
		selectedValue.add(item.value);
		selectedItems.add(item);
		filterInput?.focus();
	}
	const has = function (item: op) {
		return selectedItems.has(item);
	};

	//$: dispatch('select', selectedItems);

	function handle(e: MouseEvent) {
		const target = e.target as HTMLElement;

		if (container?.contains(target)) {
			return;
		} else if (show) {
			show = false;
		}
	}
	$effect(() => {
		if (container) {
			return untrack(() => {
				document.addEventListener('click', handle);
				return () => document.removeEventListener('click', handle);
			});
		}
	});

	let tag_custom = $state('');
	let tag_validator = z.string().min(3).max(60);
</script>

<div
	role="button"
	tabindex="0"
	aria-pressed="false"
	class={twMerge('relative w-full ', classes)}
	class:disabled
	bind:this={container}
>
	<!-- hidden select input , used to store value -->
	<!-- <input class="hidden" {...rest} /> -->
	<div class="border-1 flex w-full min-h-10 h-10 justify-around">
		<div
			class="inline-flex flex-wrap min-h-10 max-h-20 overflow-y-auto items-start gap-3 grow-3 justify-start items-center"
			role="button"
		>
			<div class="w-70% shrink-0 h-full inline-flex flex-wrap">
				{#each selectedItems as item}
					<button
						class="h-9/10 w-fit min-w-0 max-w-[100px] inline-block border-2 border-gray bg-orange-1 capitalize text-sm p-1 rounded-3 truncate"
						onclick={() => {
							status = 'user_update';
							remove(item);
						}}
						type="button"
					>
						{displaySelectedLabel ? item.label : item.value}
					</button>
				{/each}
			</div>
			<input
				class="inline-block min-w-5 w-8 grow-2 outline-none h-9/15 border-l-1"
				placeholder={selectedItems.size > 0 && size > 1
					? '+' + selectedItems.size
					: 'Search'}
				bind:value={filterText}
				bind:this={filterInput}
				class:hidden={disableSearch}
				onclick={() => {
					show = true;
				}}
			/>
			<!-- {#if size > 1}
				<span
					class="hidden absolute top-[-15px] right-0 md:inline-flex items-center h-full text-center"
				>
					+{selectedItems.size}
				</span>
			{/if} -->
		</div>
		<!-- close dropdown icon -->
		<button
			class="ml-auto inline w-1/9 h-full min-w-[22px]"
			type="button"
			onclick={() => {
				show = !show;
			}}
			aria-labelledby="close"
			aria-label="close"
		>
			<svg
				height="20"
				width="20"
				viewBox="0 0 20 20"
				aria-hidden="true"
				focusable="false"
				class="inline"
			>
				<path
					d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
				></path>
			</svg>
		</button>
	</div>
	<!-- dropdown list -->
	<div
		class="options absolute left-0 right-0 bg-white border-1 shadow-inset z-3 w-full h-300px overflow-x-hidden overflow-y-auto"
		class:hidden={show == false}
	>
		{#if enable_search}
			<span class="flex">
				<Input
					bind:value={filterText}
					class="m-2 grow-1"
					placeholder="Search"
				/>
			</span>
		{/if}
		<!-- custom  -->
		{#if allowCustomOptionItems}
			<span class="flex">
				<Input
					maxlength={60}
					minlength={3}
					class="m-2 grow-1"
					bind:value={tag_custom}
					placeholder="custom tags, size limit 3-60"
				/>
				<button
					disabled={!tag_custom ||
						customItems.length >= maxCustomItemSize ||
						!tag_validator.safeParse(tag_custom).success}
					onclick={() => {
						customItems.push(tag_custom);
						tag_custom = '';
					}}
					type="button"
					class="grow-0 w-100px text-center disabled:opacity-20 disabled:cursor-not-allowed"
				>
					Add Tag
				</button>
			</span>
		{/if}
		<div class="border-y-1">
			{#each customItems as item, index}
				<button
					class="my-2 mx-2 p-1 rounded-3 border-1 bg-orange-1"
					onclick={(e: MouseEvent) => {
						e.stopImmediatePropagation();
						e.preventDefault();
						customItems.splice(index, 1);
					}}
				>
					{item} [x]
				</button>
			{/each}
		</div>
		<!-- custom  -->
		{#if fiteredItem.length == 0}
			<button disabled class="opacity-65 ml-5">Empty</button>
		{/if}
		{#each fiteredItem as item}
			<button
				data-value={item.value}
				type="button"
				onclick={() => {
					status = 'user_update';
					if (has(item)) {
						remove(item);
						console.log('removed', item);
						return;
					}
					if (size == 1) {
						selectedItems.clear();
						add(item);
						toggleDropdown();
					} else if (arr.length < size) {
						add(item);
						if (selectedItems.size == items.length) {
							toggleDropdown();
						}
					}
				}}
				class="capitalize pl-2 dropdown-items hover:bg-lime-1"
				class:bg-blue={has(item)}
			>
				{item.label}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					class:hidden={icon == false}
					viewBox="0 0 48 48"
					class="inline text-amber"
				>
					<path
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="4"
						d="m4 24l5-5l10 10L39 9l5 5l-25 25L4 24Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{/each}
	</div>
</div>

<style>
	.disabled {
		pointer-events: none;
	}
	.disabled * {
		opacity: 0.7;
	}
	.dropdown-items {
		display: block;
		width: 100%;
		font-size: large;
		margin-top: 2px;
		line-height: 2rem;
		text-align: start;
		letter-spacing: 2px;
	}

	.options {
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.24);
	}
	.select:hover {
		background-color: bisque;
	}
</style>
