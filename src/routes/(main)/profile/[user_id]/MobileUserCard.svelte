<script>
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Avatar,
		AvatarFallback,
		AvatarImage
	} from '$lib/components/ui/avatar';
	import { Switch } from '$lib/components/ui/switch';
	import BookOpen from 'lucide-svelte/icons/book-open'
import Settings from 'lucide-svelte/icons/settings'
import User from 'lucide-svelte/icons/user'
import Bell from 'lucide-svelte/icons/bell'
import Shield from 'lucide-svelte/icons/shield'
import HelpCircle from 'lucide-svelte/icons/help-circle'
import Moon from 'lucide-svelte/icons/moon'
import Sun from 'lucide-svelte/icons/sun';

	let darkMode = $state(false);

	function toggleDarkMode() {
		$darkMode = !$darkMode;
		document.documentElement.classList.toggle('dark');
	}

	onMount(() => {
		// Initialize dark mode based on system preference or saved setting
		$darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.classList.toggle('dark', $darkMode);
	});
</script>

<div class:dark={darkMode} class="min-h-screen">
	<div
		class="container mx-auto p-4 space-y-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
	>
		<header
			class="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
		>
			<div class="flex items-center space-x-4 mb-4 sm:mb-0">
				<Avatar class="h-20 w-20">
					<AvatarImage src="/placeholder.svg" alt="User" />
					<AvatarFallback>UN</AvatarFallback>
				</Avatar>
				<div>
					<h1 class="text-2xl font-bold">User Name</h1>
					<p class="text-muted-foreground">user@example.com</p>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<Moon class="h-4 w-4" />
				<Switch checked={$darkMode} on:change={toggleDarkMode} />
				<Sun class="h-4 w-4" />
			</div>
		</header>

		<main class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card class="bg-blue-50 dark:bg-blue-900">
				<CardHeader>
					<CardTitle
						class="flex items-center space-x-2 text-blue-700 dark:text-blue-300"
					>
						<BookOpen class="h-5 w-5" />
						<span>Subscribed Books</span>
					</CardTitle>
				</CardHeader>
				<CardContent class="grid grid-cols-2 sm:grid-cols-3 gap-4">
					{#each Array(6) as _, book}
						<div class="flex flex-col items-center">
							<img
								src="/placeholder.svg?height=120&width=80&text=Book{book + 1}"
								alt="Book {book + 1}"
								class="w-20 h-30 object-cover shadow rounded"
							/>
							<p class="mt-2 text-sm font-medium text-center">
								Book Title {book + 1}
							</p>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card class="bg-green-50 dark:bg-green-900">
				<CardHeader>
					<CardTitle
						class="flex items-center space-x-2 text-green-700 dark:text-green-300"
					>
						<BookOpen class="h-5 w-5" />
						<span>Last Created Chapter</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<h3 class="font-semibold">Chapter 5: The Mystery Unfolds</h3>
					<p class="text-sm text-muted-foreground">Book: The Great Adventure</p>
					<p class="text-sm text-muted-foreground">Created: 2 days ago</p>
				</CardContent>
			</Card>

			<Card class="bg-purple-50 dark:bg-purple-900">
				<CardHeader>
					<CardTitle
						class="flex items-center space-x-2 text-purple-700 dark:text-purple-300"
					>
						<BookOpen class="h-5 w-5" />
						<span>Last Read Chapter</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<h3 class="font-semibold">Chapter 12: The Final Battle</h3>
					<p class="text-sm text-muted-foreground">Book: Epic Fantasy Saga</p>
					<p class="text-sm text-muted-foreground">Read: Yesterday</p>
				</CardContent>
			</Card>

			<Card class="md:col-span-2 lg:col-span-2 bg-amber-50 dark:bg-amber-900">
				<CardHeader>
					<CardTitle
						class="flex items-center space-x-2 text-amber-700 dark:text-amber-300"
					>
						<BookOpen class="h-5 w-5" />
						<span>Read History</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2">
						{#each [{ title: 'The Catcher in the Rye', author: 'J.D. Salinger', date: '2 days ago' }, { title: 'To Kill a Mockingbird', author: 'Harper Lee', date: '1 week ago' }, { title: '1984', author: 'George Orwell', date: '2 weeks ago' }, { title: 'Pride and Prejudice', author: 'Jane Austen', date: '1 month ago' }] as book}
							<li class="flex justify-between items-center border-b pb-2">
								<div>
									<p class="font-medium">{book.title}</p>
									<p class="text-sm text-muted-foreground">{book.author}</p>
								</div>
								<span class="text-sm text-muted-foreground">{book.date}</span>
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>

			<Card class="bg-rose-50 dark:bg-rose-900">
				<CardHeader>
					<CardTitle
						class="flex items-center space-x-2 text-rose-700 dark:text-rose-300"
					>
						<Settings class="h-5 w-5" />
						<span>User Settings</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-2 gap-4">
						{#each [{ icon: User, label: 'Profile' }, { icon: Bell, label: 'Notifications' }, { icon: Shield, label: 'Privacy' }, { icon: HelpCircle, label: 'Help' }] as setting}
							<Button
								variant="outline"
								class="flex items-center justify-start space-x-2"
							>
								<svelte:component this={setting.icon} class="h-4 w-4" />
								<span>{setting.label}</span>
							</Button>
						{/each}
					</div>
				</CardContent>
			</Card>
		</main>
	</div>
</div>
