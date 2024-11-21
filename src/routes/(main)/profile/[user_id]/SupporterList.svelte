<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import CalendarIcon from 'lucide-svelte/icons/calendar'
import BookOpenIcon from 'lucide-svelte/icons/book-open';
	let { class: classes = 'w-1/3 max-w-2xl ' }: { class: string } = $props();
	let books = [
		{
			id: 1,
			title: 'The Midnight Library',
			author: 'Matt Haig',
			dateRead: '2023-06-15',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 2,
			title: 'Atomic Habits',
			author: 'James Clear',
			dateRead: '2023-05-22',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 3,
			title: 'The Alchemist',
			author: 'Paulo Coelho',
			dateRead: '2023-04-30',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 4,
			title: 'Dune',
			author: 'Frank Herbert',
			dateRead: '2023-03-18',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 5,
			title: 'To Kill a Mockingbird',
			author: 'Harper Lee',
			dateRead: '2023-02-05',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 6,
			title: '1984',
			author: 'George Orwell',
			dateRead: '2023-01-10',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 7,
			title: 'The Great Gatsby',
			author: 'F. Scott Fitzgerald',
			dateRead: '2022-12-20',
			coverUrl: '/placeholder.svg?height=120&width=80'
		},
		{
			id: 8,
			title: 'Pride and Prejudice',
			author: 'Jane Austen',
			dateRead: '2022-11-15',
			coverUrl: '/placeholder.svg?height=120&width=80'
		}
	];
</script>

{#snippet BookItem(book)}
	<div
		class="flex items-center space-x-2 p-1 hover:bg-accent rounded-md transition-colors"
	>
		<!-- <img
			src={book.coverUrl}
			alt={`Cover of ${book.title}`}
			class="w-full h-1/2 object-cover rounded-md shadow-md"
		/> -->
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium text-foreground truncate">UserName</p>
			<p class="text-sm text-muted-foreground">{book.author}</p>
			<!-- <Badge variant="secondary" class="mt-1 text-xs flex items-center w-fit">
				<CalendarIcon class="mr-1 h-3 w-3" />
				{book.dateRead}
			</Badge> -->
		</div>
	</div>
{/snippet}

<Card class={classes}>
	<CardHeader>
		<CardTitle class="text-2xl flex items-center">
			<BookOpenIcon class="mr-2 h-6 w-6" />
			Supporters
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-1 gap-1 max-h-200px overflow-auto">
			{#each books as book}
				{@render BookItem(book)}
			{/each}
		</div>
	</CardContent>
</Card>
