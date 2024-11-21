<script lang="ts">
	import type { profile } from '$lib/types';
	import { Avatar, AvatarFallback, AvatarImage } from '$components/ui/avatar';
	import { twMerge } from 'tailwind-merge';
	import { user as u } from '$lib/state/runes.svelte';
	import type { profileSelected } from '$lib/queries/user/fields';
	let values = {
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-20 w-20'
	};

	let {
		enableHref = true,
		showImage = true,
		avatarImageClass = '',
		user = u,
		class: classes = '',
		src,
		size = 'sm',
		username,
		userId
	}: {
		user?: { username: string; avatar_url: null | string; id?: string } | null;
		userId?: string;
		enableHref?: boolean;
		showImage?: boolean;
		avatarImageClass?: string;
		size?: keyof typeof values;
		src?: string | null;
		class?: string;
		username?: string;
	} = $props();
</script>

{#snippet Content()}
	<!-- <img
		class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-200 dark:ring-gray-500"
		src={src || (user?.avatar_url ?? '')}
		alt="Bordered avatar"
	/>
 -->
	<Avatar class={twMerge(values[size], classes)}>
		{#if showImage}
			<AvatarImage
				src={src || (user?.avatar_url ?? '')}
				alt={username ?? user?.username ?? userId}
				class={avatarImageClass}
			/>
		{/if}
		<AvatarFallback class={classes}>{user?.username.charAt(0)}</AvatarFallback>
	</Avatar>
{/snippet}
{#if enableHref == false}
	{@render Content()}
{:else}
	<a
		href="/profile/{userId || user?.id}"
		class="inline-block mx-auto my-0"
		data-sveltekit-preload-data="tap"
	>
		{@render Content()}
	</a>
{/if}

<style>
	/* your styles go here */
</style>
