<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { useGetBookReadHistory } from '$lib/queries/book/getBooks';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import UserSetting from './UserSetting.svelte';
	import Cog from 'lucide-svelte/icons/cog'
import Shield from 'lucide-svelte/icons/shield'
import BookOpen from 'lucide-svelte/icons/book-open'
import Heart from 'lucide-svelte/icons/heart';
	import { timeAgo } from '$lib/utils/timeAgo';
	let { class: classes }: { class: string } = $props();
	let siteTitle = 'My Awesome Site';
	let siteDescription = 'Welcome to my site!';
	let mfaEnabled = false;
	let recentBooks = [
		'The Pragmatic Programmer',
		'Clean Code',
		'Design Patterns'
	];
	let newBook = '';
	let patreonLinked = false;
	let buyMeCoffeeLinked = false;

	const handleAddBook = () => {
		if (newBook) {
			recentBooks = [newBook, ...recentBooks.slice(0, 4)];
			newBook = '';
		}
	};
	let modal = $state({
		readHistory: false,
		userConfig: false,
		achievements: false
	});
	const history = useGetBookReadHistory(() => true);
</script>

{#snippet button({ icon, text, disabled, onclick })}
	<DialogTrigger>
		<Button
			{disabled}
			{onclick}
			variant="outline"
			class="w-full h-20px  text-center text-md font-semibold  bg-neutral-100 hover:bg-white/30 text-[#29524A] border-0 transition-all duration-300 ease-in-out transform hover:scale-105"
		>
			<icon class="mr-1 h-6 w-6"></icon>
			{text}
		</Button>
	</DialogTrigger>
{/snippet}
<div class="glass rounded-3xl h-fit w-400px max-w-screen space-y-6 {classes}">
	<div class="grid grid-cols-2 gap-1 items-center justify-center p-3">
		<!-- Site Config Dialog -->
		<Dialog bind:open={modal.userConfig}>
			{@render button({
				icon: Cog,
				text: 'Site Config',
				disabled: false,
				onclick: () => {
					modal.userConfig = true;
				}
			})}

			<DialogContent class="sm:max-w-[425px] max-h-1/2-vh overflow-auto">
				<DialogHeader>
					<DialogTitle>Edit Site Configuration</DialogTitle>
					<DialogDescription>
						Make changes to your site configuration here. It will save
						automatically
					</DialogDescription>
				</DialogHeader>
				<UserSetting />
				<!-- 	<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="site-title" class="text-right">Site Title</Label>
						<Input id="site-title" bind:value={siteTitle} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="site-description" class="text-right">Description</Label>
						<Input
							id="site-description"
							bind:value={siteDescription}
							class="col-span-3"
						/>
					</div>
				</div> -->
				<DialogFooter>
					<Button variant="outline" onclick={() => (modal.userConfig = false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- Security Settings Dialog -->
		<Dialog>
			{@render button({
				icon: Shield,
				text: 'Security',
				disabled: true,
				onclick: () => {
					modal.userConfig = true;
				}
			})}
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Security Settings</DialogTitle>
					<DialogDescription>
						Enable or disable Multi-Factor Authentication (MFA) for your
						account.
					</DialogDescription>
				</DialogHeader>
				<div class="flex items-center space-x-2 py-4">
					<Switch id="mfa" bind:checked={mfaEnabled} />
					<Label for="mfa">Enable Multi-Factor Authentication</Label>
				</div>
				<DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		<!-- Recent Books Dialog -->
		<Dialog bind:open={modal.readHistory}>
			{@render button({
				icon: BookOpen,
				text: 'Recent Books',
				disabled: false,
				onclick: () => {
					modal.readHistory = true;
				}
			})}

			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Recent Read Books</DialogTitle>
					<DialogDescription>You past 20 readings!</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<!-- <div class="flex items-center space-x-2">
						<Input placeholder="Add a new book" bind:value={newBook} />
						<Button on:click={handleAddBook}>Add</Button>
					</div> -->
					<ul class="space-y-2">
						{#each history.data ?? [] as book}
							<a href="/book/{book.id}" class="hover:text-blue">
								<li class="flex items-center space-x-2">
									<BookOpen class="h-4 w-4" />
									<span class="max-w-2/3 truncate">{book.title}</span>
									<span class="text-sm text-gray">
										{timeAgo(book.user_book_data[0]?.updated_at)}
									</span>
								</li>
							</a>
						{/each}
					</ul>
				</div>
				<!-- <DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter> -->
			</DialogContent>
		</Dialog>

		<!-- Support Links Dialog -->
		<Dialog>
			{@render button({ icon: Heart, text: 'Social Links', disabled: true })}

			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Support Platform Links</DialogTitle>
					<DialogDescription>
						Connect or disconnect your support platform accounts.
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="flex items-center space-x-2">
						<Switch id="patreon" bind:checked={patreonLinked} />
						<Label for="patreon">Link Patreon Account</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch id="buyMeCoffee" bind:checked={buyMeCoffeeLinked} />
						<Label for="buyMeCoffee">Link Buy Me a Coffee Account</Label>
					</div>
				</div>
				<DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		<!-- Support Links Dialog -->
		<Dialog>
			{@render button({ icon: Heart, text: 'Link Patreon', disabled: true })}

			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Support Platform Links</DialogTitle>
					<DialogDescription>
						Connect or disconnect your support platform accounts.
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="flex items-center space-x-2">
						<Switch id="patreon" bind:checked={patreonLinked} />
						<Label for="patreon">Link Patreon Account</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch id="buyMeCoffee" bind:checked={buyMeCoffeeLinked} />
						<Label for="buyMeCoffee">Link Buy Me a Coffee Account</Label>
					</div>
				</div>
				<DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		<!-- Support Links Dialog -->
		<Dialog>
			{@render button({
				icon: Heart,
				text: 'Link BuyMeACoffee',
				disabled: true
			})}

			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Support Platform Links</DialogTitle>
					<DialogDescription>
						Connect or disconnect your support platform accounts.
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="flex items-center space-x-2">
						<Switch id="patreon" bind:checked={patreonLinked} />
						<Label for="patreon">Link Patreon Account</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch id="buyMeCoffee" bind:checked={buyMeCoffeeLinked} />
						<Label for="buyMeCoffee">Link Buy Me a Coffee Account</Label>
					</div>
				</div>
				<DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		<!-- Support Links Dialog -->
		<!-- 	<Dialog>
			{@render button({
				icon: Heart,
				text: 'Achievements',
				disabled: false,
				onclick: () => {
					modal.achievements;
				}
			})}
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Achievements</DialogTitle>
					<DialogDescription>
						Connect or disconnect your support platform accounts.
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="flex items-center space-x-2">
						<Switch id="patreon" bind:checked={patreonLinked} />
						<Label for="patreon">Link Patreon Account</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch id="buyMeCoffee" bind:checked={buyMeCoffeeLinked} />
						<Label for="buyMeCoffee">Link Buy Me a Coffee Account</Label>
					</div>
				</div>
				<DialogFooter>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog> -->
	</div>
</div>
