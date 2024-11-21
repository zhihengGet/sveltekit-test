<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { format } from 'date-fns';
	import { toastNotify } from '$lib/utils/toast';
	import {
		useGetMessageFromAuthorToFollower,
		useGetAllMessageForUser
	} from '$lib/queries/message/followMessage';
	import { user } from '$lib/state/runes.svelte';
	import { useSendFollowerMessage } from '$lib/queries/message/mutate/send';
	import Dropdown from '$components/dropdown.svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { Collapsible } from '$components/ui/collapsible';
	import Text from '$components/text.svelte';
	import BarLoader from '$lib/icons/loader/BarLoader.svelte';
	import { MAX_NUMBER_OF_FOLLOWER_MESSAGE } from '$lib/data/constants';

	interface AuthorMessageModalProps {
		isOpen: boolean;
		onClose: () => void;
		isPremium: boolean;
		messagesRemaining: number;
		title: string;
		description: string;
	}

	let {
		isOpen = $bindable(false),
		onClose,
		isPremium,
		messagesRemaining,
		title
	}: AuthorMessageModalProps = $props();

	let message = $state('');
	let expirationDate = $state<string>();
	let scheduleDate = $state<string>();
	let isExpirationEnabled = $state(false);
	let enableScheduleTime = $state(false);
	let importance = $state({ level: 'low' });
	let isCalendarOpen = $state(false);
	const followMessage = useGetMessageFromAuthorToFollower(() => user.id);
	const sender = useSendFollowerMessage();
	function handleSubmit() {
		/* if (!expirationDate) {
			return console.error("missing expiration date")
		} */
		if (
			followMessage.data?.messages &&
			followMessage.data?.messages?.length > 100
		) {
			error = 'You can only have 100 message at the time ! Please remove one !';
			return;
		}
		// Here you would typically send the message to your backend
		console.log('Submitting message:', message, 'Expiration:', expirationDate);
		toastNotify.success('Your message has been sent to all users.');
		const prev = followMessage.data?.messages ?? [];
		let n = {
			message,
			expirationDate: expirationDate
				? new Date(expirationDate).getTime()
				: null,
			importance: importance,
			created_at: Date.now(),
			scheduleTime: scheduleDate ? new Date(scheduleDate).getTime() : undefined
		};
		prev.push(n);
		sender.mutate(prev);
		//followMessage.data.messages.push(n);
		//onClose();
	}
	const ImportanceLevel = {
		importanceLevels: [
			{
				level: 'urgent',
				score: 10,
				description: 'Requires immediate attention'
			},
			{
				level: 'high',
				score: 8,
				description: 'Very important, should be addressed soon'
			},
			{
				level: 'medium',
				score: 5,
				description: 'Moderately important, address when possible'
			},
			{
				level: 'low',
				score: 3,
				description: 'Not time-sensitive, can be addressed later'
			},
			{
				level: 'trivial',
				score: 1,
				description: 'Minimal importance, may not require action'
			}
		]
	};
	const message_lvl = {
		messagePriorities: [
			{
				level: 'critical',
				score: 5,
				color: '#FF0000'
			},
			{
				level: 'important',
				score: 4,
				color: '#FFA500'
			},
			{
				level: 'normal',
				score: 3,
				color: '#FFFF00'
			},
			{
				level: 'low',
				score: 2,
				color: '#00FF00'
			},
			{
				level: 'trivial',
				score: 1,
				color: '#808080'
			}
		]
	};
	let isSubmitDisabled = $derived(
		message.length === 0 || message.length > 300 || messagesRemaining === 0
	);
	function deleteOneMessage(idx: number) {
		if (followMessage.data) {
			followMessage.data.messages = followMessage.data.messages.filter(
				(v, i) => i !== idx
			);
			sender.mutate(followMessage.data.messages);
		}
	}
	function deleteAll(idx: number) {
		sender.mutate([]);
	}
	let has_items = $derived(followMessage.data?.messages.length > 0);
	let has_expired_item = $derived(
		followMessage.data?.messages?.filter(
			(v) => v.expirationDate && v.expirationDate < Date.now()
		) > 0 ?? false
	);
	function delExpire() {
		if (followMessage.data) {
			const newer =
				followMessage.data?.messages?.filter(
					(v) => !v.expirationDate || v.expirationDate > Date.now()
				) ?? [];
			sender.mutate(newer);
			followMessage.data.messages = newer;
		}
	}
	let error = $state('');
	let colors = $state({});
	const now = new Date();
</script>

<Dialog bind:open={isOpen} onOpenChange={onClose}>
	<DialogContent class="sm:max-w-[520px]">
		<DialogHeader>
			<DialogTitle>{title}</DialogTitle>
			<DialogDescription>
				Compose a message to send to all your users. You can send {messagesRemaining}
				no more than {MAX_NUMBER_OF_FOLLOWER_MESSAGE} message. Old message need to
				be deleted;
			</DialogDescription>
		</DialogHeader>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="message">Message</Label>
				<p class="text-red">{error}</p>
				<Textarea
					id="message"
					bind:value={message}
					placeholder="Enter your message here..."
					class="h-32"
				/>
				<p
					class={`text-sm ${message.length > 300 ? 'text-red-500' : 'text-muted-foreground'}`}
				>
					{message.length}/300 characters
				</p>
			</div>
			<div class="flex items-center space-x-2">
				<Switch id="expiration" bind:checked={isExpirationEnabled} />
				<Label for="expiration">Set expiration date</Label>
			</div>
			{#if isExpirationEnabled}
				<div class="flex flex-col space-y-2">
					<Label for="expirationDate">Expiration Date</Label>
					<div class="relative">
						<!-- <Input
							id="expirationDate"
							value={expirationDate ? format(expirationDate, 'PPP') : ''}
							readonly
							on:click={() => (isCalendarOpen = true)}
							class="cursor-pointer"
						/> -->
						<!-- 	<CalendarIcon class="absolute right-3 top-3 h-4 w-4 opacity-50" /> -->

						<div class=" z-10 mt-2">
							<input
								id="expirationDate"
								type="date"
								bind:value={expirationDate}
							/>
						</div>
					</div>
				</div>
			{/if}
			<div class="flex items-center space-x-2">
				<Switch id="expiration" bind:checked={enableScheduleTime} />
				<Label for="expiration">Set Message Visible Date</Label>
			</div>
			{#if enableScheduleTime}
				<div class="flex flex-col space-y-2 pl-2">
					<Label for="scheduler" class="text-md">
						Schedule Show Date(UTC Time)
						<span class="text-neutral-500 text-sm">
							{scheduleDate ? timeAgo(scheduleDate, now) : ''}
						</span>
					</Label>
					<span class=" ">
						<input
							id="scheduler"
							type="datetime-local"
							bind:value={scheduleDate}
							min={now.toISOString().split('T')[0]}
						/>
					</span>
				</div>
			{/if}
			<!-- <div class="border-1 ">
				<label for="bg">Background</label>
				<input id="bg" type="color" />

				<label for="tg">Word Color</label>
				<input id="tg" type="color" />
				<div style="background-color:{}">{message}</div>
			</div> -->

			<span>Select A Importance Level</span>
			<Dropdown
				buttonString={importance.level}
				items={{
					importance: message_lvl.messagePriorities.map((v) => {
						return {
							str: v.level,
							onClick: () => {
								importance = v;
							}
						};
					})
				}}
			></Dropdown>
			{#if followMessage.isLoading}
				<BarLoader />
			{/if}

			<div class="max-h-300px overflow-auto flex flex-col">
				{#each followMessage.data?.messages || [] as item, idx}
					<div
						class="bg-secondary h-fit p-2 my-2"
						style={'color:' + item.importance?.color}
					>
						{#if item?.expirationDate && item?.expirationDate <= Date.now()}
							<span class="text-yellow-600 font-bold">Expired</span>
						{/if}
						<div></div>
						<Text class="" el="div" text={item.message} enableMore={true}
						></Text>

						<span class="text-sm text-gray capitalize">
							created at:{timeAgo(item.created_at)}
						</span>
						<div class="flex border-b-2 flex-col">
							{#if item.scheduleTime}
								<div class=" text-neutral-400 text-sm capitalize">
									schedule Time: {item.scheduleTime
										? timeAgo(item.scheduleTime, now)
										: ''}
								</div>
							{/if}
							{#if item.expirationDate}
								<span class="text-secondary text-sm capitalize">
									expiration Date: {item.expirationDate
										? timeAgo(item.expirationDate, now)
										: ''}
								</span>
							{/if}
						</div>
						<div>
							<button
								class="text-sm float-right p-2 text-red hover:text-red-200"
								onclick={() => deleteOneMessage(idx)}
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<DialogFooter>
			<Button
				variant="destructive"
				size="sm"
				onclick={() => {
					delExpire();
				}}
				disabled={!has_expired_item || followMessage.isLoading}
			>
				Clean Expired
			</Button>
			<Button
				size="sm"
				variant="destructive"
				onclick={() => {
					sender.mutate([]);
					if (followMessage.data) followMessage.data.messages = [];
				}}
				disabled={!has_items || followMessage.isLoading}
			>
				Delete All
			</Button>
			<Button onclick={onClose} variant="outline">Close</Button>
			<Button
				size="sm"
				onclick={handleSubmit}
				disabled={isSubmitDisabled || followMessage.isLoading}
			>
				Send Message
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
