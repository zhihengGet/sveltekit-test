<script lang="ts">
	//import { differenceInCalendarYears } from 'date-fns';
	import UserCard from './User.svelte';
	import {
		Avatar,
		AvatarFallback,
		AvatarImage
	} from '$lib/components/ui/avatar';
	import type { profile } from '$lib/types';
	let { data }: { data: { profile: profile | null; publicProfile: profile } } =
		$props();

	//const folders = $derived(buckets?.data?.folders.concat(['default']));
</script>

<div class="hidden md:block"><UserCard {data} /></div>
<header
	class="flex md:hidden w-full flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
>
	<div class="flex items-center space-x-4 mb-4 sm:mb-0">
		<Avatar class="h-20 w-20">
			<AvatarImage src={data.publicProfile.avatar_url} alt="User" />
			<AvatarFallback>UN</AvatarFallback>
		</Avatar>
		<div>
			<h1 class="text-2xl font-bold">User Name</h1>
			<p class="text-muted-foreground">user@example.com</p>
		</div>
	</div>
	<!-- 	<div class="flex items-center space-x-2">
				<Moon class="h-4 w-4" />
				<Switch checked={$darkMode} on:change={toggleDarkMode} />
				<Sun class="h-4 w-4" />
			</div> -->
</header>

<style>
	.glass {
		background: rgba(255, 255, 255, 0.8);
		box-shadow: 8px -7px 49px 4px rgba(195, 209, 186, 1);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.18);
	}
</style>
