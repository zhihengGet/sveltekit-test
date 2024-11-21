<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	let open = $state(false);
	interface Props {
		dataset?: { value: any; label: string }[];
		initialText?: string;
		class?: string;
		value?: string;
	}

	let {
		dataset = [],
		initialText = '',
		class: classes = '',
		value = $bindable('')
	}: Props = $props();

	let selectedValue = $derived(
		dataset.find((f) => f.value === value || f.label == value)?.label ??
			initialText
	);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

{value}
<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('w-[200px] justify-between truncate', classes)}
			>
				{selectedValue}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0 h-50">
		<Command.Root bind:value disablePointerSelection={true}>
			<Command.Input placeholder={initialText} />
			<Command.List
				class="max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2"
			>
				<Command.Empty
					class="flex w-full items-center justify-center pb-6 pt-8 text-sm text-muted-foreground"
				>
					No results found.
				</Command.Empty>
				<Command.Empty>{initialText}</Command.Empty>
				<Command.Group class=" overflow-auto">
					{#each dataset as framework}
						<Command.Item value={framework.value}>
							<Check
								class={cn(
									'mr-2 h-4 w-4',
									value !== framework.value && 'text-transparent'
								)}
							/>
							{framework.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
