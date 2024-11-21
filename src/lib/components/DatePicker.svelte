<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone
	} from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';

	let { ...props } = $props<{
		value: DateValue | undefined;
		id: string;
		oninput: (s: string) => {};
	}>();
	// Get the calendar identifier for the current user.
	//let calendarIdentifier = new Intl.DateTimeFormat().resolvedOptions().calendar; // e.g. 'gregory'
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn(
				'w-[280px] justify-start text-left font-normal',
				!props.value && 'text-muted-foreground'
			)}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{props.value
				? df.format(props.value.toDate(getLocalTimeZone()))
				: 'Pick a date'}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value={props.value} initialFocus />
	</Popover.Content>
</Popover.Root>
