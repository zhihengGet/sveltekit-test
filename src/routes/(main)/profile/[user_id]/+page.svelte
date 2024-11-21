<script lang="ts">
	import Shelf from './Shelf.svelte';

	import AuthoredList from './AuthoredList.svelte';

	import TopUserSection from './TopUserSection.svelte';

	import { user } from '$lib/state/runes.svelte';
	import { profileStore } from './store.svelte';
	//import { differenceInCalendarYears } from 'date-fns';
	import FolderManager from '$components/shared/FolderManager.svelte';
	import type { book, user_book_data } from '$lib/types';
	import ArtworkList from '../ArtwortList.svelte';
	import ArtworkListDialog from '$lib/composite/ArtworkListDialog.svelte';
	import Hen from './Hen.svelte';
	import CreateArtworkButton from '$lib/composite/CreateArtworkButton.svelte';
	import QuickOptions from './QuickOptions.svelte';
	import RecentChapters from './RecentChapters.svelte';
	import AchievementBadgesCard from './AchievementBadgesCard.svelte';
	let { data } = $props();
	const publicProfile = $derived(
		user?.id === data.publicProfile?.id ? user : data.publicProfile
	); // other users' profile

	const isSelf = $derived(user?.id === data.publicProfile?.id);
	//const folders = $derived(buckets?.data?.folders.concat(['default']));
</script>

<svelte:head>
	<title>{user.username}</title>
	<meta name={user.username} content={user.about_you} />
	<meta property="og:type" content="text/html" />
	<meta property="og:url" content={data.publicProfile.avatar_url} />
	<meta property="og:image" content={user.avatar_url} />
</svelte:head>
<FolderManager type="shelf" bind:bindOpen={profileStore.openBucketDialog} />

<div
	class="md:container w-full my-[2px] md:my-5 h-fit flex flex-col items-center justify-center"
>
	<TopUserSection {data}></TopUserSection>
</div>

<div class="md:container min-h-screen">
	{#if data.profile?.id === data.publicProfile?.id}
		<QuickOptions class="mx-auto block md:hidden" />
	{/if}
	<div><AchievementBadgesCard user={data.publicProfile} /></div>
	<div class="w-full my-[2px] md:my-5 flex justify-between">
		<AuthoredList {data}></AuthoredList>
		<!-- recent created chapters -->
		<div class="mx-1 glass w-fit shrink-0">
			<RecentChapters author={data.publicProfile} />
		</div>
	</div>
	<!-- {#if isSelf}
		<Shelf {data}></Shelf>
	{/if} -->

	<div class="glass p-3 my-[2px] md:mb-5 min-h-fit mb-10">
		<h2 class="text-3xl font-bold flex items-center text-amber-900 pb-2">
			<Hen />
			Artwork
			<ArtworkListDialog user_id={data?.publicProfile?.id} />
			<CreateArtworkButton />
		</h2>
		<ArtworkList user_id={publicProfile?.id} />
	</div>
</div>
<div class="h-20"></div>

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
