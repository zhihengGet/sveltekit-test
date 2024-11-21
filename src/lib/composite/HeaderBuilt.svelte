<script lang="ts">
	import { Button } from '$components';
	import Header from '$lib/components/Header.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import * as Menubar from '$lib/components/ui/menubar';
	import { user } from '$lib/state/runes.svelte';
	import { log_out } from '$lib/queries';
	import Avatar from '$components/avatar.svelte';
	import { AuthDialog } from '$lib/state/login.svelte';
	import Search from '$components/search.svelte';
	import { headerControl, uiControl } from '$lib/state/ui.svelte';
	import Shelf from '$components/svg/shelf.svelte';
	import { useIsMobile, useMediaQuery } from '$lib/utils/mediaQuery.svelte';
	import { SITE_NAME } from '$lib/data/constants';
	import Home from 'lucide-svelte/icons/home';
	import PencilLine from 'lucide-svelte/icons/pencil-line';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import BellIMessage from './BellIMessage.svelte';
	import { dev } from '$app/environment';

	let { top = true }: { top?: boolean } = $props();
	const isMobile = useIsMobile();

	function portal(el: HTMLElement) {
		//document.body.appendChild(el);
	}
	onNavigate(() => {
		if ($page.url.pathname.startsWith('/book')) {
			headerControl.openBottomHeader = true;
		}
	});
</script>

{#if headerControl.openTopHeader && isMobile.match && top}
	<nav class=" h-10 flex items-center justify-between md:hidden">
		<a
			href="/"
			class="text-green-600 font-extrabold hover:underline align-middle"
		>
			{SITE_NAME}
		</a>
		<!-- <a href="/" class=" font-extrabold hover:underline align-middle mr-2">
			Welcome !
		</a> -->
		<div class="flex items-center">
			<BellIMessage variant="ghost" />
		</div>
	</nav>
{/if}
{#if headerControl.openTopHeader && isMobile.match == false && top}
	<nav class="h-10 flex items-center justify-between md:hidden">
		<a
			href="/"
			class="text-green-600 font-extrabold hover:underline align-middle"
		>
			{SITE_NAME}
		</a>

		<a href="/" class=" font-extrabold hover:underline align-middle mr-2">
			Welcome !
		</a>
	</nav>
	<Header
		class="sticky bottom-initial top-0 flex gap-2 flex flex-wrap items-center justify-center"
		style="{uiControl.header.style} background-color:;"
	>
		<div slot="left" class="prose lg:prose-xl">
			<!-- <img
				src="/icons/icon1.png"
				class="w-8 h-8 inline clipper"
				alt="site icon"
			/> -->
			<a href="/" class="text-green-600 font-extrabold hover:underline">
				{SITE_NAME}
			</a>
			<a
				href="https://www.reddit.com/r/forkread/"
				class="font-bold ml-2 hover:underline"
				target="_blank"
			>
				Forum
			</a>

			<!-- 	<Button variant="ghost" disabled>Artworks</Button> -->
		</div>
		<div slot="middle" class="hidden md:block"><Search /></div>
		<span class="hidden md:flex items-center gap-3" slot="right">
			<BellIMessage />
			<a
				class:hidden={user.authStatus !== 'signed in'}
				href="/library"
				class="hover:underline font-600 text-gray-900 text-[16px] inline-flex justify-center gap-1"
				data-sveltekit-preload-data={user.authStatus === 'signed in'
					? 'hover'
					: ''}
				class:opacity-50={user.authStatus !== 'signed in'}
			>
				<!-- <PenLine class="inline-block text-sm" /> -->
				Library
			</a>
			<a
				class:hidden={user.authStatus !== 'signed in'}
				href="/chatrooms"
				class="hover:underline font-600 text-gray-900 text-[16px] inline-flex justify-center gap-1"
				data-sveltekit-preload-data={user.authStatus === 'signed in'
					? 'hover'
					: ''}
				class:opacity-50={user.authStatus !== 'signed in'}
			>
				<!-- <PenLine class="inline-block text-sm" /> -->
				Chatrooms
			</a>

			<a
				class:hidden={user.authStatus !== 'signed in'}
				href="/dashboard"
				class="hover:underline font-600 text-gray-900 text-[16px] inline-flex justify-center gap-1"
				data-sveltekit-preload-data={user.authStatus === 'signed in'
					? 'hover'
					: ''}
				class:opacity-50={user.authStatus !== 'signed in'}
			>
				<!-- <PenLine class="inline-block text-sm" /> -->
				Write
			</a>
			{#if dev}
				<ThemeToggle />
			{/if}
			<!-- {user.authStatus} -->
			<!-- <Button variant="ghost" data-sveltekit-preload-data>My Shelf</Button> -->
			<Button
				variant="ghost"
				onclick={log_out}
				class={user.authStatus == 'signed in'
					? 'hover:underline font-bold'
					: 'hidden'}
			>
				Log Out
			</Button>

			{#if user.authStatus == 'signed in'}
				<Avatar {user} />
			{/if}

			{#if user.authStatus == 'signing out' || user.authStatus == 'signing in'}
				<div>{user.authStatus}</div>
			{/if}

			{#if user.authStatus == 'signed out' || user.authStatus == 'anon'}
				<Button
					variant="default"
					data-sveltekit-preload-data
					onclick={() => {
						AuthDialog.toggleOpen();
					}}
				>
					Log in
				</Button>
			{/if}
		</span>
	</Header>
{/if}

{#if headerControl.openBottomHeader && isMobile.match && !top}
	<div
		class="md:hidden sticky bottom-0 flex h-10 gap-2 bg-background w-full flex items-center justify-evenly z-10"
		use:portal
	>
		<a href="/" class="flex flex-col text-nowrap items-center">
			<Home size={'16px'} class="mt-1" />
			<span class="text-xs">Home</span>
		</a>
		{#if user.authStatus == 'signed in'}
			<a href="/library" class="flex flex-col text-nowrap items-center">
				☯
				<span class="text-xs">Shelf</span>
			</a>

			<!-- <Drawer title="" description="" bind:open={openDrawer} class="max-h-9/10">
				<svelte:fragment slot="trigger" let:builder>
					<button
						use:builder.action
						{...builder}
						class="flex flex-col text-nowrap items-center"
					>
						<Shelf width="25px" height="25px" />
					</button>
				</svelte:fragment>
				<div>Shelved</div>
			</Drawer> -->
		{/if}
		<Search class="w-10 border-amber " />
		{#if user.authStatus == 'signed in'}
			<a
				href="/dashboard"
				data-sveltekit-preload-data
				class="flex flex-col text-nowrap items-center h-full justify-between"
			>
				<PencilLine size={'16px'} class="mt-1" />
				<span class="text-xs">Create</span>
			</a>
		{/if}
		{#if user.authStatus !== 'signed in'}
			<button
				class="text-[15px] rounded"
				onclick={(e) => {
					e.stopPropagation();
					e.stopImmediatePropagation();
					e.preventDefault();
					AuthDialog.toggleOpen();
				}}
			>
				Log in
			</button>
		{/if}
		{#if user.authStatus === 'signed in'}
			<Menubar.Root class="border-0 rounded-0 basis-[40px] m-0 p-0">
				<Menubar.Menu>
					<Menubar.Trigger class="p-0 ">
						<Avatar {user} enableHref={false} />
					</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item>
							<a href="/profile/{user.id}">Profile</a>
						</Menubar.Item>
						<Menubar.Item onclick={log_out}>Log out</Menubar.Item>
						<Menubar.Separator />
					</Menubar.Content>
				</Menubar.Menu>
			</Menubar.Root>
		{/if}
	</div>
{/if}

<!-- mobile version -->
<!-- <Header classes="md:hidden">
	<div slot="middle">
		<Button>Ranking</Button>
		<Button>Filter</Button>
	</div>
</Header> -->

<style>
	@media only screen and (max-width: 600px) {
		.hidden_mobile {
			display: none;
		}
	}

	.clipper {
		clip-path: circle(50% at 50% 50%);
	}
</style>
