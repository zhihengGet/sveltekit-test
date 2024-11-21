<script lang="ts">
	import { Breadcrumb, Link } from '$components';
	import { Card } from '$lib/components/ui/card/index';
	import { useGetBookConfig } from '$lib/queries';
	import RssIcon from 'lucide-svelte/icons/rss'
import PawPrintIcon from 'lucide-svelte/icons/paw-print'
import DiscIcon from 'lucide-svelte/icons/disc'
import FacebookIcon from 'lucide-svelte/icons/facebook';
	import PatreonLogo from './PatreonLogo.svelte';
	import Facebook from './facebook.svelte';
	import Twitter from './twitter.svelte';
	import { twMerge } from 'tailwind-merge';
	import { cn } from '$lib/utils';
	import { random } from 'lodash-es';
	let { book_id, class: classes }: { book_id: number; class: string } =
		$props();
	const config = useGetBookConfig(() => {
		return { book_id };
	});
	const n = random(1, 3);
	let socials = $derived(
		[
			{
				name: 'Reddit',
				url: config.data?.reddit,
				icon: RssIcon,
				color: 'orange',
				text: 'Follow us on reddit'
			},
			{
				name: 'Facebook',
				url: config.data?.facebook,
				icon: Facebook,
				color: 'lightblue',
				text: 'Follow us on facebook'
			},
			{
				name: 'Discord',
				url: config.data?.discord,
				icon: DiscIcon,
				color: 'purple',
				text: 'Join our discord channel'
			},
			{
				name: 'Patreon',
				url: config.data?.patreon,
				icon: PatreonLogo,
				color: 'darkgray',
				text: 'A small pledge on Patreon can make a big difference'
			},
			{
				name: 'Twitter',
				url: config.data?.twitter,
				icon: Twitter,
				color: 'darkgray',
				text: 'Stay close to what sets your soul on fire.' // 'Twitter is the bird that never sleeps, unless you aXe it.'
			}
		].filter((v) => !!v.url)
	);
</script>

{#snippet card()}
	<Card class="w-fit max-w-screen p-2 grid gap-2 h-fit shrink-0 {classes}">
		<div class="flex items-center justify-between flex-col">
			<h3 class="text-xl font-semibold hidden md:block">Connect</h3>
			{#if socials.length == 0}
				No Social
			{/if}
			<div class="flex items-center gap-4 opacity-100 md:opacity-0">
				{#each socials as social}
					<a
						href={social.url}
						class="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition"
					>
						<div
							class="bg-muted rounded-full p-3 flex items-center justify-center"
						>
							<social.icon class="w-6 h-6" />
						</div>
						<span class="text-sm">{social.name}</span>
					</a>
				{/each}
			</div>
		</div>
		<div class="hidden md:grid grid-cols-4 gap-4">
			{#each socials as social}
				<a
					href={social.url}
					class="text-muted-foreground flex items-center flex-col"
				>
					<div
						class="bg-muted rounded-full p-3 flex items-center justify-center"
					>
						<social.icon class="w-6 h-6" style="color:{social.color}" />
					</div>
					<span class="text-gray text-sm capitalize text-center">
						{social.name}
					</span>
				</a>
			{/each}
		</div>
	</Card>
{/snippet}
{#snippet card2()}
	<Card class={cn('w-full max-w-sm p-6 grid gap-6', classes)}>
		<div class="space-y-2">
			<h3 class="text-xl font-semibold">Connect with Us</h3>
			<p class="text-muted-foreground">
				{socials.length > 0
					? 'Follow us on our social channels'
					: 'No Socials No Distraction'}
			</p>
		</div>
		<div class="grid gap-4">
			{#each socials as social}
				<a class="flex items-center gap-3" href={social.url}>
					<div class="rounded-md p-2 flex items-center justify-center">
						<social.icon class="w-5 h-5"></social.icon>
					</div>
					<div>
						<div class="font-medium">{social.name}</div>
						<div class="text-sm text-muted-foreground">{social.text}</div>
					</div>
				</a>
			{/each}
		</div>
	</Card>
{/snippet}

{#snippet card3()}
	<Card class={cn('w-full max-w-sm p-6 grid gap-6', classes)}>
		<div class="space-y-1 block">
			<h3 class="text-xl font-semibold">Connect with Us</h3>
			<p class="text-muted-foreground">
				{socials.length > 0
					? 'Follow us on our social channels'
					: 'No Socials No Distraction'}
			</p>
		</div>
		<div class="grid gap-1">
			{#each socials as social}
				<a class="flex items-center gap-3" href={social.url}>
					<div class="rounded-md p-1 flex items-center justify-center">
						<social.icon class="w-5 h-5"></social.icon>
					</div>
					<div>
						<div class="font-medium">{social.name}</div>
						<div class="text-sm text-muted-foreground">{social.text}</div>
					</div>
				</a>
			{/each}
		</div>
	</Card>
{/snippet}

{#if n == 1}
	{@render card()}
{/if}
{#if n == 2}
	{@render card2()}
{/if}
{#if n == 3}
	{@render card3()}
{/if}
