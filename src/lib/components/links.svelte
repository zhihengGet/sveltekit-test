<script>
	import { cn } from '$lib/utils';

	let {
		href = '',
		isLoading = false,
		isDisabled = false,
		class: classes = '',
		children,
		...rest
	} = $props();
</script>

<a
	class={cn(
		'link-drop-shadow  p-2 rounded' +
			(isDisabled ? ' opacity-50 pointer-events-none' : ''),
		classes
	)}
	{href}
	{...rest}
>
	{@render children?.()}
	{isLoading ? '...' : ''}
</a>

<!-- markup (zero or more items) goes here -->

<style>
	/* your styles go here */
</style>
