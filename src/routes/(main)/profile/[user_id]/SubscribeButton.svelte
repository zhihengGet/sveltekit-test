<script lang="ts">
	import {
		useAddFollower,
		useRemoveFollower
	} from '$lib/queries/follow/follower';
	import type { profileWithUserData } from '$lib/types';

	let { profile }: { profile: profileWithUserData } = $props();
	if (!profile.user_profile_data) {
		console.error('please pass user profile data here to subscribe !');
	}
	let is_follow = $state(profile.user_profile_data?.is_follower);
	const follow = useAddFollower();
	const unf = useRemoveFollower();
</script>

<button
	class="font-medium bell w-fit h-24px"
	onclick={() => {
		is_follow = !is_follow;
		follow.mutate({ user_id: profile.id, is_follow });
	}}
>
	<!-- 🔔 -->
	<span
		class="inline-block overflow-clip transition-width ease-in-out delay-150 text capitalize"
	>
		{is_follow ? 'unfollow' : 'follow'}
	</span>
</button>

<!-- <style>
	.bell:hover .text {
		width: fit-content;
	}
</style> -->
