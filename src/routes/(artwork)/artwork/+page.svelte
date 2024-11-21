<script lang="ts">
	import ArtworkCard from '$components/ArtworkCard.svelte';
	import PaginateUi from '$components/PaginateUI.svelte';
	import CreateArtworkButton from '$lib/composite/CreateArtworkButton.svelte';
	import { useGetArtworks } from '$lib/queries/storage/useArtwork';
	import { user } from '$lib/state/runes.svelte';
	import { debounce } from 'lodash-es';

	const deb = debounce((v) => (ui.pageStore.search.regex = v), 500);
	let ui: PaginateUi<any, any> = $state({
		pageStore: { search: { regex: '' } }
	});
</script>

<header
	class="bg-transparent dark:bg-gray-950 py-4 px-6 dark:border-gray-800 shadow-sm"
>
	<div class="container mx-auto flex gap-1 items-center justify-between">
		<h1 class="text-2xl font-bold">Artwork</h1>
		<CreateArtworkButton />
		<div class="relative flex w-full max-w-md">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</svg>
			<!-- 	{#if }
				
			{/if} -->
			<input
				oninput={(e) => deb(e.target.value)}
				class="flex h-10 border border-input px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-white dark:bg-gray-900 pl-10 pr-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-700 dark:focus:ring-primary-500 dark:focus:border-primary-500"
				placeholder="Search by title or artist"
				type="search"
			/>
		</div>
	</div>
</header>
<main class="container mx-auto py-8 px-6">
	<PaginateUi
		useQuery={useGetArtworks}
		filter={{ user_id: user.id }}
		paginate={{ start: 0, end: 1, size: 1 }}
		bind:this={ui}
	>
		{#snippet Render(data)}
			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
			>
				{#each data as w}
					<ArtworkCard artwork={w} />
				{/each}
			</div>
		{/snippet}
	</PaginateUi>

	<!-- footer -->
	<!-- 	<div class="flex justify-center mt-8">
		<nav
			aria-label="pagination"
			class="mx-auto flex w-full justify-center"
			role="navigation"
		>
			<ul class="flex flex-row items-center gap-1">
				<li class="">
					<a
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5"
						aria-label="Go to previous page"
						href="#"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="m15 18-6-6 6-6"></path>
						</svg>
						<span>Previous</span>
					</a>
				</li>
				<li class="">
					<a
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
						href="#"
					>
						1
					</a>
				</li>
				<li class="">
					<a
						aria-current="page"
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
						href="#"
					>
						2
					</a>
				</li>
				<li class="">
					<a
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
						href="#"
					>
						3
					</a>
				</li>
				<li class="">
					<a
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5"
						aria-label="Go to next page"
						href="#"
					>
						<span>Next</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="m9 18 6-6-6-6"></path>
						</svg>
					</a>
				</li>
			</ul>
		</nav>
	</div> -->
</main>
