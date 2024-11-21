<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Avatar from '$components/avatar.svelte';
	import type { user_chatroom_data } from '$lib/types';
	import Badge from '$components/ui/badge/badge.svelte';
	import {
		statusToBackgroundColor,
		useCheckMuteInfo,
		useCount
	} from './util.svelte';
	import Dots from './Dots.svelte';
	import Crown from 'lucide-svelte/icons/crown'
import ShieldEllipsis from 'lucide-svelte/icons/shield-ellipsis'
import Baby from 'lucide-svelte/icons/baby';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { user } from '$lib/state/runes.svelte';
	import { DAY_IN_Milliseconds } from '$lib/data/constants';

	let {
		data,
		is_muted,
		wsStatus
	}: {
		data: user_chatroom_data;
		is_muted: boolean;
		wsStatus: 'online' | 'offline';
	} = $props();

	const muted_info = useCheckMuteInfo(() => {
		return {
			mute_params: {
				duration: data.mute_duration,
				start_date: data.mute_start_date
			},
			countdown: true
		};
	});
	let isAdmin = $derived(data.role == 'admin');
	let isMod = $derived(data.role == 'moderator');
	let status = Object.keys(statusToBackgroundColor);
	let Icon = $derived(isAdmin ? Cake : isMod ? Mod : Usr);
</script>

<div
	class="flex items-center rounded justify-start w-9/10 min-h-3em p-2 m-2 shadow {user.id ==
	data.user_id
		? 'bg-lime-100'
		: 'bg-[#FAEBD7]'} "
>
	<Avatar username={data.name} userId={data.user_id} class="" />
	<div class="grow-1 text-center shrink-0 text-sm w-5em pl-1">
		<p class="truncate text-center font-bold">{data.name}</p>
		<p class="flex items-center justify-around">
			<Badge
				variant="secondary"
				style="background:{statusToBackgroundColor[data.status]}"
			>
				<span
					class="text-blue-100 line-height-loose capitalize tracking-wide hidden lg:inline-block"
				>
					{muted_info().mute_info.is_muted ? 'muted' : data.status}
				</span>
				<Dots status={wsStatus} />
				<span class="hidden md:inline">
					{muted_info().time ? muted_info().time + 's' : ''}
				</span>
			</Badge>
			{#if Icon}
				{@render Icon()}
			{/if}
		</p>
	</div>
</div>

{#snippet Cake()}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<svg
					height="16px"
					width="16px"
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="0 0 512 512"
					xml:space="preserve"
					fill="#000000"
				>
					<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
					<g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					></g>
					<g id="SVGRepo_iconCarrier">
						<path
							style="fill:#FF8048;"
							d="M473.336,165.967C497.844,189.204,512,221.578,512,256s-14.156,66.796-38.664,90.033 c0.889,33.758-11.984,66.65-36.313,90.99c-23.439,23.428-54.598,36.335-87.749,36.335c-1.08,0-2.161-0.011-3.23-0.045 C322.808,497.844,290.433,512,256,512l-56.264-92.835L371.341,256L199.736,92.835L256,0c34.433,0,66.808,14.156,90.044,38.687 c1.069-0.034,2.149-0.045,3.218-0.045c33.162,0,64.321,12.907,87.76,36.335C461.351,99.317,474.225,132.209,473.336,165.967z"
						></path>
						<path
							style="fill:#FFA46E;"
							d="M256,337.582V512c-34.433,0-66.808-14.156-90.044-38.687c-1.069,0.034-2.149,0.045-3.218,0.045 c-33.162,0-64.321-12.907-87.76-36.335c-24.328-24.34-37.202-57.231-36.313-90.99C14.156,322.796,0,290.422,0,256 s14.156-66.796,38.664-90.033c-0.889-33.758,11.984-66.65,36.313-90.99c23.439-23.428,54.598-36.335,87.76-36.335 c1.069,0,2.149,0.011,3.218,0.045C189.192,14.156,221.567,0,256,0v174.418L174.418,256L256,337.582z"
						></path>
						<path
							style="fill:#FFECBA;"
							d="M276.66,305.883c-6.673-1.35-13.582-2.059-20.66-2.059c-7.078,0-13.987,0.709-20.66,2.059 l-54.655,131.927c16.181,24.362,43.874,40.431,75.315,40.431s59.122-16.069,75.303-40.42 C348.835,358.131,337.02,331.303,276.66,305.883z"
						></path>
						<path
							style="fill:#FFD875;"
							d="M222.186,289.815c-5.007-4.996-10.386-9.374-16.069-13.154L74.178,331.303 c-5.773,28.683,2.442,59.617,24.677,81.841c22.224,22.235,53.158,30.45,81.83,24.666c33.769-33.77,54.655-80.401,54.655-131.927 C231.559,300.201,227.182,294.822,222.186,289.815z"
						></path>
						<path
							style="fill:#12F8BC;"
							d="M206.117,235.34L74.189,180.685C49.827,196.867,33.758,224.56,33.758,256s16.069,59.122,40.42,75.303 c47.757,0,95.502-18.207,131.938-54.643c1.35-6.673,2.059-13.582,2.059-20.66S207.467,242.013,206.117,235.34z"
						></path>
						<path
							style="fill:#0DCD9B;"
							d="M180.697,74.178c-28.683-5.773-59.617,2.442-81.841,24.677c-22.235,22.224-30.45,53.158-24.666,81.83 c33.769,33.769,80.401,54.655,131.927,54.655c5.683-3.781,11.061-8.158,16.069-13.154c4.996-5.007,9.374-10.386,13.154-16.069 L180.697,74.178z"
						></path>
						<path
							style="fill:#FFECBA;"
							d="M256,33.758c-31.44,0-59.122,16.069-75.303,40.42c0,47.757,18.207,95.502,54.643,131.938 c6.673,1.35,13.582,2.059,20.66,2.059c7.078,0,13.987-0.709,20.66-2.059l54.655-131.927C315.133,49.827,287.44,33.758,256,33.758z"
						></path>
						<path
							style="fill:#FFD875;"
							d="M413.145,98.855c-22.224-22.235-53.158-30.45-81.83-24.666 c-33.77,33.769-54.655,80.401-54.655,131.927c3.781,5.683,8.158,11.061,13.154,16.069c5.007,4.996,10.386,9.374,16.069,13.154 l131.938-54.643C443.595,152.013,435.38,121.08,413.145,98.855z"
						></path>
						<path
							style="fill:#F95FF2;"
							d="M437.822,180.697c-47.757,0-95.502,18.207-131.938,54.643c-1.35,6.673-2.059,13.582-2.059,20.66 c0,7.078,0.709,13.987,2.059,20.66l131.927,54.655c24.362-16.181,40.431-43.874,40.431-75.315S462.173,196.878,437.822,180.697z"
						></path>
						<path
							style="fill:#D23ACB;"
							d="M305.883,276.66c51.526,0,98.158,20.885,131.927,54.655c5.784,28.672-2.431,59.606-24.666,81.83 c-22.224,22.235-53.158,30.45-81.83,24.666c-0.011-47.745-18.218-95.491-54.655-131.927c3.781-5.683,8.158-11.061,13.154-16.069 C294.822,284.818,300.201,280.441,305.883,276.66z"
						></path>
						<g>
							<circle
								style="fill:#FFD875;"
								cx="284.132"
								cy="402.286"
								r="8.44"
							></circle>
							<circle
								style="fill:#FFD875;"
								cx="256"
								cy="433.231"
								r="8.44"
							></circle>
						</g>
						<circle
							style="fill:#840C7F;"
							cx="379.33"
							cy="339.552"
							r="8.44"
						></circle>
						<circle
							style="fill:#FFD875;"
							cx="256"
							cy="78.769"
							r="8.44"
						></circle>
						<g>
							<circle
								style="fill:#0DCD9B;"
								cx="109.714"
								cy="284.132"
								r="8.44"
							></circle>
							<circle
								style="fill:#0DCD9B;"
								cx="78.769"
								cy="256"
								r="8.44"
							></circle>
						</g>
						<g>
							<circle
								style="fill:#E7C05C;"
								cx="339.552"
								cy="132.67"
								r="8.44"
							></circle>
							<circle
								style="fill:#E7C05C;"
								cx="381.322"
								cy="130.678"
								r="8.44"
							></circle>
							<circle
								style="fill:#E7C05C;"
								cx="124.714"
								cy="379.33"
								r="8.44"
							></circle>
						</g>
					</g>
				</svg>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Admin</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

{#snippet Mod()}
	<ShieldEllipsis size={16} />
{/snippet}
{#snippet Usr()}
	<Baby size={16} />
{/snippet}
