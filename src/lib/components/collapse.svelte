<script module>
	let component_id = 0;
</script>

<script lang="ts">
	interface Props {
		classes?: string;
		isOpen?: boolean;
		title?: import('svelte').Snippet;
		contents?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let {
		classes = '',
		isOpen = $bindable(true),
		title,
		contents,
		children
	}: Props = $props();

	component_id += 1;
	let id = component_id + '-sv-collapse';
</script>

<!-- collapse -->

<span class={'text-base ' + classes}>
	<input {id} type="checkbox" class="peer hidden" bind:checked={isOpen} />
	<label
		class=" w-auto cursor-pointer py-3 pr-3 inline-flex group/label justify-center items-center gap-2 rounded-md border border-transparent text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all dark:focus:ring-offset-gray-800 capitalize hover:underline flex-nowrap overflow-auto"
		for={id}
	>
		{@render title?.()}
		<!-- arrow icon -->
		<span
			class="inline-block text-base i-ph:triangle-thin arrow transition-[transform] {isOpen &&
				'rotate-180'}"
		></span>
	</label>

	<!-- show content if button is checked -->
	<span
		class="peer-checked:block transition-[height] ease-in-out duration-300 {isOpen
			? ' block'
			: 'hidden'}"
	>
		{@render contents?.()}
		{@render children?.()}
	</span>
</span>

<style>
</style>
