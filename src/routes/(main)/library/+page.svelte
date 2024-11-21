<script lang="ts">
	import Book from 'lucide-svelte/icons/book';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Clock from 'lucide-svelte/icons/clock';
	import Grid from 'lucide-svelte/icons/grid';
	import List from 'lucide-svelte/icons/list';
	import Moon from 'lucide-svelte/icons/moon';
	import Search from 'lucide-svelte/icons/search';
	import Sun from 'lucide-svelte/icons/sun';
	import Plus from 'lucide-svelte/icons/plus';
	import Tag from 'lucide-svelte/icons/tag';
	import X from 'lucide-svelte/icons/x';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Button from '$lib/components/button.svelte';
	import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
	import {
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import {
		useGetBookReadHistory,
		useGetShelvedBooksAll,
		useUpdateShelvedBooks
	} from '$lib/queries';
	//import ShelfBook from '../profile/[user_id]/ShelfBook.svelte';
	import { flushSync, untrack } from 'svelte';
	import { debounce, uniqBy, isNil } from 'lodash-es';
	import Image from '$components/Image.svelte';
	import { DEFAULT_FOLDER, MaxTagOnShelvedBook } from '$lib/data/constants';
	import ScrollAreaScrollbar from '$components/ui/scroll-area/scroll-area-scrollbar.svelte';

	let shouldRefresh = $state(false);
	let bookQuery = useGetShelvedBooksAll(() => shouldRefresh);
	//let books = $derived(bookQuery.data?.books || []);
	let history = useGetBookReadHistory(() => true);

	let darkMode = $state(false);
	///let buckets = $state([]);
	let selectedBucket = $state('default');
	let viewMode: 'grid' | 'list' = $state('grid');
	let searchQuery = $state('');
	let newBucketName = $state('');
	let newTag = $state('');
	let selectedBooks: { [s in string]: boolean } = $state({});
	let selectedTags: string[] = $state([]);
	let selectedTagsValues: string[] = $state([]);
	let curr_data: NonNullable<typeof bookQuery.data> = $state({
		books: [],
		customUserTags: []
	});
	const mutate = useUpdateShelvedBooks();
	/* $effect(() => {
		let books = bookQuery.data?.books;
		let temp = {};
		for (let x of books ?? []) {
			temp[x.id] = x;
		}
		normalizedData = { books: temp, tagList: bookQuery.data?.customUserTags };
	}); */
	$effect(() => {
		curr_data = $state.snapshot(
			bookQuery.data ?? { books: [], customUserTags: [] }
		);
		untrack(() => {
			curr_data.books = curr_data.books ?? [];
			curr_data.customUserTags = curr_data.customUserTags ?? [];
		});
	});
	const setViewMode = (v: typeof viewMode) => {
		viewMode = v;
	};
	// tag to books for remove and
	// book id to tags for update book tags
	let utils = $derived.by(() => {
		let data = curr_data;
		if (bookQuery.data) {
			let book_id_tags: any = {};
			let tag_to_books: any = {};
			let book_id_to_idx: any = {};
			let all_tags = new Set(data.customUserTags);
			let index = 0;
			for (let x of data.books ?? []) {
				book_id_to_idx[x.id] = index++;
				book_id_tags[x.id] = [];
				for (let y of x.customUserTags ?? []) {
					console.log('loop tags', y);
					book_id_tags[x.id].push(y);
					tag_to_books[y] = tag_to_books[y] ?? [];
					tag_to_books[y].push(x);
				}
			}
			for (let x in tag_to_books) {
				tag_to_books[x] = uniqBy(tag_to_books[x], (v) => v.id);
			}
			tag_to_books['default'] = curr_data.books;
			return { book_id_tags, tag_to_books, all_tags, book_id_to_idx };
		}
		return {};
	});
	$inspect(utils);
	const deb = debounce(save, 600);
	function save(data?: typeof curr_data) {
		console.log('save', curr_data);
		let t = data ?? curr_data;
		mutate.mutate({
			...t,
			all_tags: t?.customUserTags
		});
	}
	const DEFAULT = DEFAULT_FOLDER;

	function filter() {}

	let filteredBooks = $derived(
		//@ts-ignore
		curr_data.books?.filter(
			(book) =>
				((selectedBucket === 'default' ||
					book.customUserTags.includes(selectedBucket)) &&
					(searchQuery === '' ||
						book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						book.author_name
							.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						book.tags.some((tag) =>
							tag.toLowerCase().includes(searchQuery.toLowerCase())
						) ||
						book.created_at.includes(searchQuery))) ||
				book.customUserTags.includes(searchQuery)
		) || []
	);
	function addBucket(tagArg?: string) {
		console.log('addition', curr_data, utils.all_tags);
		if (typeof tagArg != 'string') {
			console.error('wrong prop fro aadd');
			return;
		}

		let tag = tagArg ?? newBucketName;
		if (!curr_data || utils.all_tags?.has(tag) || !tag) {
			return;
		}
		if (!curr_data.customUserTags) {
			curr_data.customUserTags = [tag];
		} else curr_data.customUserTags.push(tag);
		newBucketName = '';

		deb();
	}
	/* remove tag from everywhere */
	function removeBucket(tag: string) {
		// remove from all tags
		const books_temp = utils.tag_to_books[tag];
		for (let x of books_temp ?? []) {
			const idx = x.customUserTags.findIndex((v) => v == tag);
			if (idx >= 0) {
				// found it
				x.customUserTags.splice(idx, 1);
			}
		}
		if (curr_data)
			curr_data.customUserTags = curr_data.customUserTags.filter(
				(v) => v != tag
			);
		deb();
	}
	function addTagToBook(bookId: string, tags: string[]) {
		for (let xx of tags) {
			if (!xx) continue;
			xx = xx.trim();
			if (xx.length == 0 || isNil(xx)) continue;
			addBucket(xx);
			for (let x of curr_data.books) {
				x.customUserTags = x.customUserTags ?? [];
				if (x.id == bookId) {
					if (x.customUserTags.length > 5) {
						return console.log('cant add more tags , max 5');
					}
					x.customUserTags = Array.from(new Set(x.customUserTags.concat([xx])));
				}
			}
		}
		deb();
	}

	function removeTagFromBook(bookId: string, tagToRemove: string) {
		// BOOK HAS THIS TAG
		const book = curr_data.books.find((v) => v.id == bookId);
		if (book)
			book.customUserTags = book.customUserTags.filter((v) => v != tagToRemove);

		deb();
	}
	function toggleShelf(bookId: string[]) {
		//let ids = new Set(bookId);
		curr_data.books.forEach((v) => {
			if (bookId.indexOf(v.id) > -1) {
				v.is_shelved = false;
			}
		});
		//let temp = curr_data.books.filter((v) => !v.is_shelved);
		deb($state.snapshot(curr_data));
		//curr_data.books = curr_data.books.filter((v) => v.is_shelved);
	}

	const refreshShelvedBooks = () => {
		shouldRefresh = true;
		flushSync(() => {
			bookQuery.refetch();
		});
	};
	function setSearchQuery(search: string) {
		searchQuery = search;
	}
</script>

<div class={`min-h-screen  ${darkMode ? 'dark' : ''}`}>
	<div
		class="container glass rounded mx-auto p-4 space-y-4 bg-background text-foreground transition-colors duration-200"
	>
		<div class="flex justify-between items-center">
			<h1 class="text-2xl font-bold">My Library</h1>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="icon"
					onclick={refreshShelvedBooks}
					title="Refresh shelved books"
				>
					<RefreshCw class="h-[1.2rem] w-[1.2rem]" />
				</Button>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<Input
				type="text"
				placeholder="Search books, authors, tags..."
				bind:value={searchQuery}
				class="flex-grow max-w-sm"
			/>
			<Dialog>
				<DialogTrigger>
					<Plus class="w-4 h-4 mr-2" /> Tags
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Bucket</DialogTitle>
					</DialogHeader>
					<div class="flex items-center gap-2">
						<Input bind:value={newBucketName} placeholder="Bucket name" />
						<Button onclick={() => addBucket(newBucketName)}>Create</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>

		<Tabs value="books" class="w-full">
			<TabsList>
				<TabsTrigger value="books">Books</TabsTrigger>
				<TabsTrigger value="history">History</TabsTrigger>
			</TabsList>
			<TabsContent value="books" class="space-y-4">
				<ScrollArea class="w-full whitespace-nowrap rounded-md border">
					<div class="flex space-x-2 p-2">
						{#each curr_data?.customUserTags ?? [] as tag, i}
							<span class="bg-secondary flex items-center">
								<Button
									isLoading={mutate.isPending}
									class="capitalize"
									variant={selectedBucket === tag ? 'default' : 'outline'}
									onclick={() => {
										selectedBucket = tag;
									}}
									size="sm"
								>
									{tag} ({utils.tag_to_books[tag]?.length ?? 0})
								</Button>
								<button class:hidden={i <= 6} onclick={() => removeBucket(tag)}>
									<X />
								</button>
							</span>
						{/each}
					</div>
					<Scrollbar orientation="horizontal" />
				</ScrollArea>

				<!--  -->
				<div class="flex justify-between items-center">
					<!-- <h2 class="text-xl font-semibold">
						{buckets.find((b) => b.id === selectedBucket)?.name}
					</h2> -->
					<div class="flex space-x-2">
						<Button
							variant="outline"
							size="icon"
							onclick={() => setViewMode('grid')}
							class={viewMode === 'grid'
								? 'bg-primary text-primary-foreground'
								: ''}
						>
							<Grid class="w-4 h-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onclick={() => setViewMode('list')}
							class={viewMode === 'list'
								? 'bg-primary text-primary-foreground'
								: ''}
						>
							<List class="w-4 h-4" />
						</Button>
					</div>
				</div>
				<!-- {Object.values(selectedBooks)}
				{JSON.stringify(curr_data?.customUserTags)}
				{JSON.stringify(selectedTags)} -->
				{#if Object.values(selectedBooks).includes(true)}
					<div class="flex items-center gap-2">
						<!-- {#if curr_data?.customUserTags} -->
						<Select
							type="multiple"
							name="book tags"
							bind:value={selectedTagsValues}
						>
							<SelectTrigger class="w-[180px]">
								Add tag to selected(Max {MaxTagOnShelvedBook} )
							</SelectTrigger>
							<SelectContent>
								{#each curr_data?.customUserTags as tag}
									<SelectItem value={tag} label={tag}>
										{tag}
									</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<!-- {/if} -->
						<Input
							type="text"
							placeholder="New tag"
							bind:value={newTag}
							class="w-32"
						/>
						<Button
							isLoading={mutate.isPending}
							onclick={() => {
								if (newTag || selectedTagsValues) {
									let tags = selectedTagsValues ?? [];
									if (newTag) {
										tags.push(newTag);
									}
									for (let id in selectedBooks) {
										if (selectedBooks[id]) addTagToBook(id, tags);
									}
									newTag = '';
								}
							}}
							size="sm"
						>
							Add <!-- {JSON.stringify(selectedTags)} -->
						</Button>
						<Button
							isLoading={mutate.isPending}
							onclick={() => {
								toggleShelf(Object.keys(selectedBooks));
							}}
							size="sm"
						>
							unshelf <!-- {JSON.stringify(selectedTags)} -->
						</Button>
					</div>
				{/if}
				<!-- 	{JSON.stringify(filteredBooks)} -->
				<div
					class={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}
				>
					{#each filteredBooks as book (book.id)}
						<div
							class={`relative  bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden ${viewMode === 'list' ? 'flex items-center' : ''}`}
						>
							<input
								disabled={book.customUserTags.length >= MaxTagOnShelvedBook}
								type="checkbox"
								bind:checked={selectedBooks[book.id]}
								class="absolute top-2 left-2 border-1"
							/>
							<Button
								class="absolute top-0 right-2 text-[#86BBD8] capitalize border-1 border-blue bg-[#336699] font-bold hover:bg-[#336699]"
								size="sm"
								variant="ghost"
								isLoading={mutate.isPending}
								onclick={() => {
									toggleShelf([book.id]);
								}}
							>
								UnShelf
							</Button>
							<Image
								src={book.cover_url}
								alt={book.title}
								class={viewMode === 'grid'
									? 'w-full h-40 object-cover'
									: 'w-20 h-30 object-cover'}
							/>
							<div class="p-2 flex-grow">
								<h3 class="font-semibold text-sm">{book.title}</h3>
								<p class="text-xs text-muted-foreground">{book.author_name}</p>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each [] as tag, index}
										<span
											class="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded-full"
										>
											{tag}
										</span>
									{/each}
								</div>
								<div class="max-h-100px flex flex-wrap gap-2">
									{#each book.customUserTags as tag, index}
										<span
											class="text-xs w-fit bg-secondary text-secondary-foreground px-1 py-0.5 rounded-full flex items-center"
										>
											{tag}
											<button
												onclick={() => removeTagFromBook(book.id, tag)}
												class="ml-1 text-secondary-foreground hover:text-primary-foreground"
											>
												<X class="w-3 h-3" />
											</button>
										</span>
									{/each}
								</div>
							</div>
							<Select
								type="single"
								onValueChange={(value) => addTagToBook(book.id, [value])}
							>
								<SelectTrigger
									class="w-fit mt-1 mx-auto mb-1 text-xs"
									disabled={book.customUserTags.length >= MaxTagOnShelvedBook}
								>
									Add User Tag (max {MaxTagOnShelvedBook})
								</SelectTrigger>
								<SelectContent>
									{#each utils.all_tags?.values() ?? [] as tag}
										<SelectItem value={tag}>
											{tag}
										</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					{/each}
				</div>

				<!-- 	<Button variant="link" class="flex items-center">
					View more <ChevronRight class="w-4 h-4 ml-1" />
				</Button> -->
			</TabsContent>

			<TabsContent value="history">
				<ScrollArea class="h-[300px] w-full rounded-md border">
					<div class="p-4">
						{#each history.data || [] as item}
							<div
								class="flex items-center justify-between py-2 border-b last:border-0"
							>
								<div>
									<h3 class="font-semibold text-sm">{item.title}</h3>
									<p class="text-xs text-muted-foreground flex items-center">
										<Clock class="w-3 h-3 mr-1" />
										{item.updated_at}
									</p>
								</div>
								<!-- <div class="w-16 h-2 bg-secondary rounded-full overflow-hidden">
									<div
										class="h-full bg-primary"
										style={`width:${item.progress}%`}
									></div>
								</div> -->
							</div>
						{/each}
					</div>
					<Scrollbar orientation="vertical" />
				</ScrollArea>
			</TabsContent>
		</Tabs>
	</div>
</div>
