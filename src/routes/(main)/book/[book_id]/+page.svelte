<script lang="ts">
	import { Breadcrumb, Link } from '$components';
	import Review from '$components/Review.svelte';
	import Separator from '$components/Separator.svelte';
	import BookCard from '$components/bookCard.svelte';
	import { Button } from '$components';
	import Chip from '$components/chip.svelte';
	import Text from '$components/text.svelte';
	import { ReviewDialog } from '$lib/composite';
	import Empty from '$lib/icons/Empty.svelte';

	import { useGetUserReview, useGetReviews, useGetReview } from '$lib/queries';
	import type { min_chapter, review } from '$lib/types';

	import { tick, untrack } from 'svelte';
	import ViewerReview from './ViewerReview.svelte';
	import type { SelectedReview } from '$lib/types/bookPage';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import DocumentReferrer from '$components/DocumentReferrer.svelte';
	import { user } from '$lib/state/runes.svelte';
	import { useGetArtworks } from '$lib/queries/storage/useArtwork';
	import ArtworkCard from '$components/ArtworkCard.svelte';
	import PaginateUi from '$components/PaginateUI.svelte';
	import { SITE_URL } from '$lib/data/constants';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { groupChapters } from '../../reader/[book_id]/[chapter_id]/helper';
	import ArtworkListDialog from '$lib/composite/ArtworkListDialog.svelte';
	import CreateArtworkButton from '$lib/composite/CreateArtworkButton.svelte';
	import { page } from '$app/stores';
	import { useUnloadURLParams } from '$lib/queries/preview/usePreview';
	import { Card } from '$lib/components/ui/card/index';
	import RssIcon from 'lucide-svelte/icons/rss'
import PawPrintIcon from 'lucide-svelte/icons/paw-print'
import DiscIcon from 'lucide-svelte/icons/disc'
import FacebookIcon from 'lucide-svelte/icons/facebook';
	import Social from '../social.svelte';
	import { fromStore } from 'svelte/store';
	import Badge from '$components/ui/badge/badge.svelte';
	import { useGetMessageForBookVisitor } from '$lib/queries/message/followMessage';
	let { data } = $props();
	let book = $derived(data!.book);

	let showAllChapters = $state(false);
	const chapter_limit = 20;
	let grouped = $derived(groupChapters(book.chapters));
	//@ts-expect-error make ts happy
	let latest_chapters: min_chapter[] = $derived(
		grouped.mainSequences.map((v) =>
			grouped.chaptersGroupByMainSeq?.[v]?.at(-1)
		) ?? []
	);
	let chapters = $derived(
		showAllChapters ? latest_chapters : latest_chapters?.slice(0, chapter_limit)
	);
	/* const books = useGetBook(data.book, data.book.id); */
	let selectedReview: SelectedReview = $state(null);

	let openReview = $state(false);
	let reviewOrder = 'like_count' as keyof review;
	//get top 4 results of review
	const op = $derived({
		filter: { book_id: book!.id },
		paginate: {
			page: 0,
			size: 5,
			orderWith: reviewOrder,
			start: 0,
			end: 5,
			asc: false
		},
		search: { regex: undefined }
	});
	const reviews = useGetReviews(() => op);
	const Selfreview = useGetUserReview(() => data.book.id);

	let displayReviews = $state(false);
	// handle url
	let review_id = $derived(
		$page.url.searchParams.get('review_id') || undefined
	);
	const target_review = useGetReview(() => review_id);
	$effect(() => {
		console.log('review_id', review_id, target_review);
		if (target_review.data && target_review.isSuccess) {
			untrack(() => {
				selectedReview = target_review.data;
				openReview = true;
			});
		}
	});
	const message = useGetMessageForBookVisitor(() => data.book.id);
	const is_valid_message = $derived((message.data?.exp ?? 0) > Date.now());
	useUnloadURLParams();
</script>

<svelte:head>
	<title>{book.title}</title>
	<meta name={data.book.title} content={data.book.summary.substring(0, 150)} />
	<meta property="og:title" content={data.book.title} />
	<meta property="og:type" content="text/html" />
	<meta property="og:url" content={SITE_URL + `/book/${data.book.id}`} />
	<meta property="og:image" content={data.book.cover_url} />
</svelte:head>
<ReviewDialog review={selectedReview} {book} bind:open={openReview} />
<ViewerReview bind:open={displayReviews} {book} showUserReview={false} />
<DocumentReferrer bid={data!.book.id} />
<main
	class="md:container w-100vw min-h-screen mx-auto flex flex-col overflow-hidden"
	style="--book-cover:url({book?.cover_url})"
>
	{#if is_valid_message}
		<div
			class="bg-blue-500 text-white p-4 mb-4 rounded-lg flex justify-start items-center"
		>
			Author Message [{message.data?.importance.level ?? 'Low'}]:
			<blockquote>
				<p class="text-lg font-medium">"{message.data?.message}"</p>
			</blockquote>
		</div>
	{/if}
	<Breadcrumb
		data={['Home', book?.category ?? 'null', book?.title ?? 'null']}
		href={['/', '/', '#']}
	/>
	{#if !book}
		<Empty />
	{:else}
		<!-- book and author -->

		<div class="w-full glass">
			<!-- desktop card -->
			<div class="relative">
				<div class="rounded shadow-lighter-border relative hidden md:block">
					<BookCard {book} type="detailed" author={data.author_profile} />
				</div>
				<!-- mobile card -->
				<div
					class="p-6 max-w-full rounded inline-block relative md:hidden"
					style="box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
				>
					<BookCard {book} type="detailed" author={data.author_profile} />
				</div>
			</div>
		</div>
		<!-- synopsis -->
		<div class={'relative mt-8 '}>
			<section
				class="leading-7 flex flex-col md:flex-row mt-10 w-full pb-3 gap-6 my-auto shadow-borderlight glass"
			>
				<div>
					<div class="inline-block min-h-52 p-2">
						<div class="text-2xl font-bold mb-1">Synopsis</div>
						<Separator />
						<Text
							text={book.summary}
							enableMore={true}
							wordLimit={500}
							class="text-base font-light text-n"
						/>
					</div>
					<div
						class="p-2 inline-flex w-full max-w-full h-fit justify-start gap-1 flex-wrap"
					>
						{#each book.maturity_levels ?? [] as item}
							<Badge class="bg-yellow text-neutral-6  capitalize">
								{item}
							</Badge>
						{/each}
						{#each book.tags ?? [] as item}
							<Chip>{item}</Chip>
						{/each}
					</div>
				</div>
				<Social book_id={book.id} class="md:block ml-auto" />
			</section>

			<!-- reviews -->
			<section
				class="leading-7 mt-10 w-full pb-3 gap-6 shadow-borderlight glass"
			>
				<Button
					size="sm"
					variant="ghost"
					class="float-right mr-5"
					onclick={() => {
						displayReviews = true;
					}}
				>
					Show More +
				</Button>
				<div class="inline-block min-h-52 p-2 w-full">
					<div class="flex gap-4 overflow-x-auto w-full">
						<QueryLoaderRunes
							CreateQueryResult={Selfreview}
							showErrorAuth={false}
						>
							{#if Selfreview.data}
								<Review
									showAvatar={false}
									review={Selfreview.data}
									onclick={() => {
										selectedReview = Selfreview.data;
										openReview = true;
									}}
								/>
							{/if}
							{#snippet EmptyUI()}
								<Button
									variant="ghost"
									class="float-right mt-1 w-40 shrink-0  my-auto min-h-20"
									size="sm"
									onclick={() => {
										selectedReview = null;
										tick().then(() => {
											openReview = true;
										});
									}}
								>
									Write a review
								</Button>
							{/snippet}
						</QueryLoaderRunes>
						<!-- other people's review -->
						<QueryLoaderRunes CreateQueryResult={reviews} showErrorAuth={false}>
							{#snippet children(prop)}
								{#each prop ?? [] as item}
									<Review
										showAvatar={false}
										review={item}
										onclick={() => {
											selectedReview = item;
											openReview = true;
										}}
										hidden={item.user_id == user.id}
									/>
								{/each}
							{/snippet}
						</QueryLoaderRunes>
					</div>
				</div>
				<!-- <div class="inline-block w-96 h-52" /> -->
			</section>
			<section class="mt-5 light shadow glass p-2">
				<h2 class="text-2xl font-bold mb-5">
					Content List [#{chapters.length}]
				</h2>

				<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
					{#each chapters || [] as chapter, index (chapter.id)}
						<a
							href={`/reader/${chapter.book_id}/${chapter.id}?preview_session_id=
								${$page.url.searchParams.get('preview_session_id') ?? ''}`}
							class="hover:text-blue truncate"
							target="_blank"
						>
							{index}. {chapter.title}
							{#if chapter.status !== 'published'}
								<span class="absolute text-sm text-gray capitalize">
									{chapter.status}
								</span>
							{/if}
						</a>
					{/each}
				</div>
				{#if chapters.length > chapter_limit}
					<Button
						variant="ghost"
						class="border-1 mx-auto p-1 flex"
						size="lg"
						onclick={() => (showAllChapters = !showAllChapters)}
					>
						{showAllChapters ? 'Hide' : 'Show All'}
						<ChevronRight />
					</Button>
				{/if}
			</section>
			<!-- News 
			<section class="mt-5">
				<h2 class="text-2xl font-bold mb-5">News</h2>
				{#each book?.tags ?? [] as item}
					<Badge variant="outline" class="capitalize ">{item}</Badge>
				{/each}
			</section>-->
			<!-- Art Works -->
			<section class="mt-5 light p-2">
				<h2 class="text-2xl font-bold mb-5">
					Art Works <ArtworkListDialog book_id={data.book.id} />
					<CreateArtworkButton
						selectedBook={data.book}
						showBookSelector={false}
					/>
				</h2>
				<PaginateUi
					useQuery={useGetArtworks}
					filter={{ book_id: book.id }}
					paginate={{ start: 0, end: 10, size: 10 }}
				>
					{#snippet Render(data)}
						<div class="flex flex-nowrap overflow-auto">
							{#each data as work}
								<ArtworkCard artwork={work} {book}></ArtworkCard>
							{/each}
						</div>
					{/snippet}
				</PaginateUi>
			</section>
			<!-- top ranking fans
			<section class="mt-5">
				<h2 class="text-2xl font-bold mb-5">Fans (Thank U!)</h2>
				<div class="w-full h-20 border-2 border-gray-400" />
			</section> -->
			<!-- Recommended 
			<section class="mt-5">
				<h2 class="text-2xl font-bold mb-5">Similar Books...</h2>
				<div class="w-full h-20 border-2 border-gray-400" />
			</section>-->
		</div>
	{/if}
</main>

<style>
	section {
		margin-bottom: 10px;
	}
</style>
