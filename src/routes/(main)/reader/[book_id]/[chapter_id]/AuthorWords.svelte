<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import {
		Avatar,
		AvatarFallback,
		AvatarImage
	} from '$lib/components/ui/avatar';
	import QuoteIcon from 'lucide-svelte/icons/quote';

	let {
		username,
		words,
		authorImageUrl
	}: { username: string; words: string; authorImageUrl: string } = $props();
</script>

<Card
	class="my-8 bg-muted dark:bg-muted/20 border-l-4 border-l-primary w-100 mx-auto"
>
	<CardContent class="p-6">
		<div class="flex flex-col space-y-4">
			<div class="flex items-center space-x-4">
				<QuoteIcon class="h-8 w-8 text-primary" />
				<p class="text-sm font-medium text-foreground dark:text-gray/100">
					{words}
				</p>
			</div>
			<div class="flex items-center space-x-4 pt-2">
				<Avatar class="h-12 w-12 border-2 border-muted-foreground/20">
					<AvatarImage src={authorImageUrl} alt={username} />
					<AvatarFallback>
						{words
							.split(' ')
							.map((n) => n[0])
							.join('')
							.toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{username}</p>
					<!--  <p class="text-xs text-muted-foreground/80">{authorTitle}</p> -->
				</div>
			</div>
		</div>
	</CardContent>
</Card>
