<script lang="ts">
	import * as Sheet from '$components/ui/sheet';
	import type { Snippet } from 'svelte';
	interface Props {
		open?: boolean;
		title?: string;
		desc: string;
		style?: string;
		closeOnOutsideClick?: boolean;
		alwaysOn?: boolean;
		class?: string;
		onOpenChange?: any;
		children?: Snippet;
		footer?: Snippet;
		titleSnippet?: Snippet;
	}

	let {
		open = $bindable(true),
		title,
		desc,
		style,
		closeOnOutsideClick = true,
		alwaysOn = false,
		class: classes = '',
		onOpenChange = (bool: boolean) => {},
		children,
		footer,
		...props
	}: Props = $props();
</script>

<Sheet.Root bind:open {onOpenChange}>
	<!-- <Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline">Open</Button>
	</Sheet.Trigger> -->
	<Sheet.Content
		interactOutsideBehavior={closeOnOutsideClick ? 'ignore' : undefined}
		preventScroll={false}
		side="right"
	>
		<Sheet.Header>
			<Sheet.Title>
				{title}{@render props.titleSnippet?.()}
			</Sheet.Title>
			<Sheet.Description class="line-clamp-5">
				{desc}
			</Sheet.Description>
		</Sheet.Header>
		{@render children?.()}
		<Sheet.Footer class="sticky bottom-0 left-1/2 mt-1">
			{@render footer?.()}
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
