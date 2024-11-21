<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import Check from 'lucide-svelte/icons/check'
import X from 'lucide-svelte/icons/x'
import BookOpen from 'lucide-svelte/icons/book-open'
import Share from 'lucide-svelte/icons/share'
import Laptop from 'lucide-svelte/icons/laptop'
import Trash2 from 'lucide-svelte/icons/trash-2';

	interface BookExtraDataProps {
		title: string;
		freeCopiesToReaders: boolean;
		arcCopiesAvailable: boolean;
		willStopPublishingOnCurrentPlatform: boolean;
		willTakeDownAfterSelfPublish: boolean;
	} // Importing $props rune for component props
	let {
		title = 'Sample Book Title',
		freeCopiesToReaders = true,
		arcCopiesAvailable = true,
		willStopPublishingOnCurrentPlatform = false,
		willTakeDownAfterSelfPublish = false
	} = $props<BookExtraDataProps>();
</script>

<Card class="w-full max-w-md">
	<CardHeader>
		<CardTitle class="text-lg font-semibold">{$title}</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<BookOpen class="w-4 h-4" />
				<span class="text-sm">Possible Free Copies!</span>
			</div>
			{#if $freeCopiesToReaders}
				<Check class="w-5 h-5 text-green-500" />
			{:else}
				<X class="w-5 h-5 text-red-500" />
			{/if}
		</div>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Share class="w-4 h-4" />
				<span class="text-sm">ARC copies available</span>
			</div>
			{#if $arcCopiesAvailable}
				<Check class="w-5 h-5 text-green-500" />
			{:else}
				<X class="w-5 h-5 text-red-500" />
			{/if}
		</div>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Laptop class="w-4 h-4" />
				<span class="text-sm">Will publish on other platforms</span>
			</div>
			{#if $willStopPublishingOnCurrentPlatform}
				<Check class="w-5 h-5 text-green-500" />
			{:else}
				<X class="w-5 h-5 text-red-500" />
			{/if}
		</div>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Trash2 class="w-4 h-4" />
				<span class="text-sm">Will take down after self-publish</span>
			</div>
			{#if $willTakeDownAfterSelfPublish}
				<Check class="w-5 h-5 text-green-500" />
			{:else}
				<X class="w-5 h-5 text-red-500" />
			{/if}
		</div>
	</CardContent>
</Card>
