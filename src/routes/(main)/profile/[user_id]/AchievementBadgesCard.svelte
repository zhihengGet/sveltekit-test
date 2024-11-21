<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import type { profile } from '$lib/types';
	import { getAchievement } from '$lib/data/achievement';
	let { user }: { user: profile } = $props();
	let progress: number[] = $state([]);
	const data = $derived.by(() => {
		const like = getAchievement('like_count', user?.like_count);
		const dislike = getAchievement('dislike_count', user?.dislike_count);
		const f = getAchievement('follower_total', user?.follower_count);
		console.log(like, dislike);

		return [like, dislike, f].filter((v) => !!v);
	});
	$effect(() => {
		progress = [user.like_count, user.dislike_count, user.follower_count];
	});
</script>

<Card class="w-full glass max-w-screen mx-auto">
	<CardHeader>
		<CardTitle class="text-2xl font-bold text-center">Achievements</CardTitle>
	</CardHeader>
	<CardContent class="grid md:gap-6 md:grid-cols-4 sm:grid-cols-2">
		{#each data as achievement, index}
			<div
				class="space-y-2 bg-secondary rounded-lg p-4 transition-all duration-300 hover:shadow-md"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<div class="p-2 bg-primary rounded-full">
							{achievement?.icon}
						</div>
						<div>
							<h3 class="font-semibold">{achievement.title}</h3>
							<p class="text-xs text-muted-foreground">
								{achievement.description}
							</p>
						</div>
					</div>
					<Badge variant="secondary" class="text-xs px-1 py-1 w-80px">
						Level {achievement.level.current}
					</Badge>
				</div>
				<Progress value={progress[index] || 0} class="h-2 bg-stone-100" />
				<div class="flex justify-between text-sm text-muted-foreground">
					<span>{achievement.min}</span>
					<span>{achievement.max}</span>
				</div>
			</div>
		{/each}
	</CardContent>
</Card>
