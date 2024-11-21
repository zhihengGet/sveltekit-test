<script lang="ts">
	import { useGetRecentChapters } from '$lib/queries/chapter/useGetChapters';
	import type { book } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import CalendarIcon from 'lucide-svelte/icons/calendar'
import BookOpenIcon from 'lucide-svelte/icons/book-open';
	import { timeAgo } from '$lib/utils/timeAgo';
	import type {
		profilePublic,
		profileSelected
	} from '$lib/queries/user/fields';
	let { author }: { author: { id: string } } = $props();
	const chapters = useGetRecentChapters(() => {
		return { author_id: author.id };
	});
</script>

{#if chapters.data}
	<div class="grid grid-cols-1 gap-4 p-1 w-full md:max-w-90vw hidden md:block">
		<h1 class="font-semibold m-1 text-center">Recently Updated Chapters</h1>
		<div class="bg-gray-100 m-1 p-1 md:w-300px">
			{#each chapters.data ?? [] as chapter}
				{@const href = `/reader/${chapter.book_id}/${chapter.id}`}
				<a
					class="p-4 rounded-lg overflow-hidden flex justify-center items-center flex-col"
					{href}
				>
					<h3 class="w-full font-light text-center truncate">
						{chapter.title}
					</h3>
					<p class="text-sm text-gray">S{chapter.sequence}</p>
					<p class="text-sm text-muted-foreground flex items-center">
						<CalendarIcon class="mr-1 h-3 w-3" />
						{timeAgo(chapter.user_modified_at)}
					</p>
				</a>
			{/each}
		</div>
	</div>
{/if}
