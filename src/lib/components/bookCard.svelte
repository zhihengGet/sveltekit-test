<script lang="ts">
	import type { book as books } from '$lib/types';
	import Category from '../icons/category.svelte';
	import Staricon from '../icons/StarIcon.svelte';
	import BookCover from './bookCover.svelte';

	import { Badge } from '$lib/components/ui/badge';
	import Empty from '$lib/icons/Empty.svelte';
	import BookInfo from './bookInfo.svelte';
	import BookStats from './BookStats.svelte';

	import { useGetBookConfig } from '$lib/queries/book/getBooks';
	import type { profileSelected } from '$lib/queries/user/fields';
	import { formatNumber } from '$lib/utils';
	import { getDays } from '$lib/utils/timeAgo';
	import Avatar from './avatar.svelte';
	import Image from './Image.svelte';
	let {
		free = true,
		book = null,
		author,
		type = 'complex3D',
		index
	}: {
		author?: profileSelected;
		free?: boolean;
		type:
			| 'simple2D'
			| 'complex2D'
			| 'simple3D'
			| 'complex3D'
			| 'detailed'
			| 'clear'
			| 'qidian';
		index?: number;
		book: books | null;
	} = $props();
	const color = {
		1: 'background-color:red; color:white;',
		2: 'background-color:orange; color:white;',
		3: 'background-color:blue; color:white;',
		4: 'background-color:blue; color:white;',
		5: 'background-color:blue; color:white;'
	};
	const config =
		type === 'detailed'
			? useGetBookConfig(() => {
					return { book_id: book?.id };
				})
			: { data: null };
</script>

{#if book == null}
	<Empty />
{:else if type === 'detailed'}
	<div class={'flex flex-wrap justify-center items-center gap-5 md:gap-20'}>
		<div class="left w-180px flex flex-wrap">
			<Image
				src={book.cover_url}
				class="book_sizing_lg shadow-md object-cover"
				alt={book.title}
			/>
			<div class="flex items-center justify-start flex-wrap gap-1 mt-1">
				<Badge variant="secondary" class="text-center">
					{book.status.toUpperCase()}
				</Badge>
				{#if book.is_visible === false}
					<Badge variant="outline" class="font-bold">
						<svg
							fill="#000000"
							viewBox="-2 -2 24 24"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="xMinYMin"
							class="jam jam-eye-close"
							width={15}
						>
							<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
							<g
								id="SVGRepo_tracerCarrier"
								stroke-linecap="round"
								stroke-linejoin="round"
							></g>
							<g id="SVGRepo_iconCarrier">
								<path
									d="M15.398 7.23l1.472-1.472C18.749 6.842 20 8.34 20 10c0 3.314-4.958 5.993-10 6a14.734 14.734 0 0 1-3.053-.32l1.747-1.746c.426.044.862.067 1.303.066h.002c-.415 0-.815-.063-1.191-.18l1.981-1.982c.47-.202.847-.579 1.05-1.049l1.98-1.981A4 4 0 0 1 10.022 14C14.267 13.985 18 11.816 18 10c0-.943-1.022-1.986-2.602-2.77zm-9.302 3.645A4 4 0 0 1 9.993 6C5.775 5.985 2 8.178 2 10c0 .896.904 1.877 2.327 2.644L2.869 14.1C1.134 13.028 0 11.585 0 10c0-3.314 4.984-6.017 10-6 .914.003 1.827.094 2.709.262l-1.777 1.776c-.29-.022-.584-.035-.88-.038.282.004.557.037.823.096l-4.78 4.779zM19.092.707a1 1 0 0 1 0 1.414l-16.97 16.97a1 1 0 1 1-1.415-1.413L17.677.708a1 1 0 0 1 1.415 0z"
								></path>
							</g>
						</svg>
					</Badge>
				{/if}

				<div class:hidden={!config.data?.discontinue} class="text-xs uppercase">
					disc
				</div>
				<div class="text-xs font-mono" class:hidden={!config.data?.freeARCCopy}>
					ARC
				</div>
			</div>
		</div>
		<!-- book data -->
		<span class="middle max-w-full md:w-1/3 max-w-full shadow-light p-2">
			<BookInfo {book} />
		</span>
		<!-- book statistic -->
		<div
			class=" self-start max-w-sm md:min-w-1/3 basis-[auto] flex justify-center flex-col shadow-borderlighter text-primary items-center h-[290px] overflow-hidden"
		>
			<div class="">
				<Avatar size="lg" userId={book.author_id} user={author} />
			</div>
			<div class="mt-5 font-bold line-clamp-2 w-3/4 text-center truncate">
				{book.display_name || book.author_name}
			</div>
			<div class="mt-auto">
				<div
					class="inline-block text-sm text-black w-20 h-15 overflow-hidden pr-1 border-r-2"
				>
					<p class="text-center">Shelf Count</p>
					<p class="text-center">{formatNumber(book.shelved_count)}</p>
				</div>

				<div
					class=" inline-block text-sm w-20 text-black h-15 overflow-hidden pr-1 border-r-2"
				>
					<p class="text-center">Word Count</p>
					<p class="text-center">
						{formatNumber(book.word_count)}
					</p>
				</div>
				<div
					class="inline-block text-sm text-black w-20 h-15 overflow-hidden pr-1"
				>
					<p class="text-center">Days Published</p>
					<p class="text-center">{-getDays(new Date(book.created_at))}</p>
				</div>
			</div>
		</div>
	</div>
	<!-- {:else if type === 'detailed2D'}
	<div class="m-10" />
	<div
		class={'flex flex-1 relative flex-wrap justify-center items-center hover:rotate-180'}
	>
		<div class="">
			<BookInfo {book} />
		</div>

		<span class="absolute">
			<BookInfo {book} color={'border-purple-400 '} />
		</span>
	</div>
{:else if type === 'freeComplex3D'}
	<div class={'h-20 overflow-hidden  w-fit scene-slide '}>
		<div
			class="parent"
			transition:slide={{
				delay: 250,
				duration: 3000,
				easing: cubicOut,
				axis: 'y'
			}}
		>
			<div class="slide_front">
				<BookInfo {book} />
			</div>

			<div class="slide_back">
				<BookInfo {book} color={'border-purple-400 '} />
			</div>
		</div>
	</div> -->
{:else if type === 'complex3D'}
	<div
		class:book-container={!free}
		class={free ? 'flex flex-1 flex-wrap justify-center items-center' : ''}
	>
		<div class="child image text-2xl book_sizing_">
			<a href="/book/{book.id}">
				<Image
					class="object-contain hover:scale-105 mx-auto transition-transform ease-out"
					src={book.cover_url}
					alt={book.title}
				/>
			</a>
		</div>
		<div
			class="child title text-2xl text-black text-extrabold capitalize dark:text-[blue] whitespace-nowrap text-ellipsis overflow-hidden"
		>
			{book.title}
		</div>
		<div class="child rating flex items-center justify-start gap-3">
			<div class="flex items-center justify-start capitalize gap-1 font-bold">
				<Category />
				{book.category}
			</div>

			<span class="flex items-center justify-start gap-1">
				<BookStats {book} />
			</span>
		</div>

		<div class="child author truncate">
			<span class="text-gray">Author</span>
			:
			<a class="text-blue" href={'/author/' + book.id}>{book.author_name}</a>
		</div>
		<div class="child description line-clamp-3">
			{book.summary}
		</div>
		<!-- <div class="child action line-clamp-3">
			<ShelfButton {book} />
		</div> -->
	</div>
{:else if type == 'complex2D'}
	<a
		href="/book/{book.id}"
		class="w-[300px] h-fit max-w-[398px] gap-1 inline-flex relative bg-white"
	>
		<span
			class="absolute left-0 top-[-5px] bg-blue-300 w-20px text-center text-white text-sm"
			style={color[index + 1]}
		>
			{index + 1}
		</span>
		<figure
			class="w-31% flex-shrink-0 book_width_md overflow-hidden object-center"
		>
			<Image
				class="object-cover hover:scale-105 mx-auto book_sizing_md transition-transform ease-out"
				src={book.cover_url}
				alt="test"
			/>
			<figcaption class="hidden truncate mx-auto book_width_md">
				{book.title}
			</figcaption>
		</figure>
		<span class="w-[100%] overflow-hidden">
			<h3 class="underline capitalize truncate">
				{book.title}
			</h3>
			<p class="line-clamp-2 text-sm font-light">
				{book.summary}
			</p>
			<span class="align-middle font-light mr-1">
				<Staricon />{book.average_rating}
			</span>
			<span class="align-middle font-light mr-1">
				<span class="i-mdi:pound-box"></span>
				{book.category}
			</span>
			<!-- 	<ShelfButton {book} /> -->
		</span>
	</a>
{:else if type == 'simple2D'}
	<a href="/book/{book.id}">
		<figure class="m-1 book_width_md overflow-hidden">
			<Image
				class="mx-auto object-fill hover:scale-105 transition-transform ease-out book_sizing_sm"
				src={book.cover_url}
				alt="test"
			/>
			{#if book.is_visible == false}
				<Badge class="absolute top-0 left-1/2">Hidden</Badge>
			{/if}
			<figcaption class="truncate book_width_md">{book.title}</figcaption>
		</figure>
	</a>
{:else if type == 'simple3D'}
	<figure class="m-1 book_width_md overflow-hidden">
		<BookCover {book} />
		<figcaption class="truncate book_width_md">{book.title}</figcaption>
	</figure>
{:else if type == 'qidian'}
	<div
		class:book-container={!free}
		class={'flex w-80vw md:w-340px h-162px shadow-gentle   bg-white'}
	>
		<div class="book-ratio w-120px shrink-0 grow-0">
			<a href="/book/{book.id}">
				<Image
					class="object-fill w-full hover:scale-105 h-full"
					src={book.cover_url}
					alt={book.title}
				/>
			</a>
		</div>

		<div class="flex flex-col h-fit p-1 overflow-hidden">
			<h2 class="text-[18px] min-h-24px line-clamp-1 font-400">
				{book.title}
			</h2>
			<div class="flex items-center text-sm text-neutral my-1">
				<div class="w-1/4 truncate">
					<a href={`/profile/${book.author_id}`}>
						{book.display_name || book.author_name}
					</a>
				</div>
				<div class="capitalize border-l-2 truncate w-1/3 text-center">
					{book.status}
				</div>
				<div class="capitalize border-l-2 w-1/3 text-center">
					{book.category}
				</div>
			</div>
			<div
				class="line-clamp-2 h-60px text-sm md:text-normal font-400 border-b-1 break-all"
			>
				{book.summary}
			</div>
			<span class="flex h-[34px] items-end justify-start">
				<BookStats {book} />
			</span>
		</div>
		<!-- <div class="child action line-clamp-3">
	<ShelfButton {book} />
</div> -->
	</div>
{/if}

<style>
	.book-container {
		margin-bottom: 1em;
		max-width: 420px;
		display: grid;
		grid-template-columns: 2fr 3fr;
		grid-template-rows: 1fr 1fr 1fr 1fr 1.5fr 1fr;
		gap: 0px 9px;
		grid-auto-flow: row;
		grid-template-areas:
			'image title'
			'image rating'
			'image author'
			'image description'
			'image description'
			'image action';
		height: 200px;
	}

	@media screen and (max-width: 400px) {
		/* 	.container {
			display: grid;
			grid-template-columns: 1fr 2fr;
			grid-template-rows: 1fr 1fr 1fr 1fr 1.1fr;
			gap: 0px 9px;
			grid-auto-flow: row;
			grid-template-areas:
				'image'
				'image'
				'image'
				'image'
				'image';
			height: 300px;
		} */
		.child:not(:first-child) {
			display: none;
		}
	}
	/* 	.container {
		border-bottom: 1px solid rgb(68, 63, 63);
		position: relative;
	} */
	.title {
		grid-area: title;
	}

	.image {
		grid-area: image;
	}
	.author {
		grid-area: author;
	}

	.rating {
		grid-area: rating;
	}

	.description {
		grid-area: description;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>
