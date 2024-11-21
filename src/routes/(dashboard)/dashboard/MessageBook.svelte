<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Card,
		CardContent,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import Trash2Icon from 'lucide-svelte/icons/trash-2';
	import SendIcon from 'lucide-svelte/icons/send';
	import { format } from 'date-fns';
	import Dialog from '$components/dialog.svelte';
	import { useGetMessageForBookVisitor } from '$lib/queries/message/followMessage';
	import { useSendMessageForBookVisitor } from '$lib/queries/message/mutate/send';
	import { isBefore } from 'date-fns';
	import type { book } from '$lib/types';
	let { open = $bindable(false), book }: { open: boolean; book: book } =
		$props();
	let message = $state('');
	let color = $state('#000000');
	let expirationDate = $state<Date | undefined>(undefined);
	let font = $state('sans-serif');
	let style = $state('normal');

	const handleDelete = () => {
		message = '';
		color = '#000000';
		expirationDate = undefined;
		font = 'sans-serif';
		style = 'normal';
	};
	const old_message = useGetMessageForBookVisitor(() => book?.id);
	const mutator = useSendMessageForBookVisitor();

	function del() {
		mutator.mutate(
			{
				message: '',
				exp: new Date().getTime(),
				book_id: book!.id
			},
			{ onSuccess: () => old_message.refetch() }
		);
	}
	function send() {
		if (!expirationDate) return alert('please enter expiration date');
		mutator.mutate(
			{
				message,
				exp: new Date(expirationDate).getTime(),
				book_id: book!.id
			},
			{ onSuccess: () => old_message.refetch() }
		);
	}
	const is_expired = $derived(
		!isBefore(
			Date.now(),
			old_message.data?.expirationDate ?? new Date('1900/1/1')
		)
	);
</script>

<Dialog bind:open>
	<Card class="w-full mx-auto shadow-lg">
		<CardHeader class="bg-gradient-to-r from-blue-500 to-purple-500">
			<CardTitle class="text-xl font-bold text-white">New Message</CardTitle>
		</CardHeader>
		<CardContent class="p-4 space-y-4">
			<div>
				<Label for="message" class="text-sm font-medium">
					Message (Max 300 characters)
				</Label>
				<Textarea
					id="message"
					bind:value={message}
					oninput={(e: Event) => {
						const target = e.target as HTMLTextAreaElement;
						message = target.value.slice(0, 300);
					}}
					placeholder="Write your message here..."
					class="mt-1 h-24 resize-none"
				/>
				<p class="text-xs text-gray-500 mt-1">
					{message.length}/300 characters
				</p>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<!-- 	<div>
					<Label for="color" class="text-sm font-medium">Text Color</Label>
					<div class="flex mt-1">
						<Input
							id="color"
							type="color"
							bind:value={color}
							class="w-10 h-8 p-0 rounded-l-md"
						/>
						<Input
							type="text"
							bind:value={color}
							on:change={(e: Event) => {
								const target = e.target as HTMLInputElement;
								color = target.value;
							}}
							class="w-full rounded-l-none"
						/>
					</div>
				</div> -->
				<div>
					<Label for="expiration" class="text-sm font-medium">Expires</Label>
					<div class="flex mt-1">
						<Input
							type="datetime-local"
							bind:value={expirationDate}
							class="w-full rounded-l-none"
						/>
					</div>
				</div>
			</div>
			<!-- 
			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label for="font" class="text-sm font-medium">Font</Label>
					<Select bind:value={font}>
						<SelectTrigger class="w-full mt-1">
							<SelectValue placeholder="Select font" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="sans-serif">Sans-serif</SelectItem>
							<SelectItem value="serif">Serif</SelectItem>
							<SelectItem value="monospace">Monospace</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label for="style" class="text-sm font-medium">Style</Label>
					<Select bind:selected={style}>
						<SelectTrigger class="w-full mt-1">
							<SelectValue placeholder="Select style" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="normal">Normal</SelectItem>
							<SelectItem value="italic">Italic</SelectItem>
							<SelectItem value="bold">Bold</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div> -->

			<!-- Preview Section -->
			<div class="border p-3 rounded-lg bg-gray-50">
				<h3 class="text-sm font-semibold mb-2">
					Last Message {is_expired ? ' Expired ' : ''}
				</h3>
				<p
					class="text-sm"
					style="
			color: {color};
			font-family: {font};
			font-style: {style === 'italic' ? 'italic' : 'normal'};
			font-weight: {style === 'bold' ? 'bold' : 'normal'};
		  "
				>
					{#if old_message.data?.message}
						{old_message.data?.message}
					{:else}
						Your message will appear here
					{/if}
				</p>
				{#if old_message.data?.expirationDate}
					<p class="text-xs text-gray-500 mt-2">
						Expires: {format(
							old_message.data?.expirationDate,
							'yyyy/MM/dd HH:mm:ss'
						)} (Year/Month/Day)
					</p>
				{/if}
			</div>
		</CardContent>
		<CardFooter class="flex justify-between bg-gray-50">
			<Button onclick={() => del()} variant="outline" size="sm">
				<Trash2Icon class="mr-2 h-4 w-4" />
				Delete
			</Button>
			<Button size="sm" onclick={() => send()}>
				<SendIcon class="mr-2 h-4 w-4" />
				Send Message
			</Button>
		</CardFooter>
	</Card>
</Dialog>
