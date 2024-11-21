<script lang="ts">
	import type { book } from '$lib/types';
	import { formatNumber } from '$lib/utils';
	import { WordCountApprox } from '$lib/utils/fileUtils';
	import Star from 'lucide-svelte/icons/star';
	import Tooltip from './Tooltip.svelte';

	let {
		book,
		class: classes = 'w-25'
	}: {
		book: book;
		class: string;
	} = $props();
</script>

<div class="book book-ratio {classes}  relative">
	<div
		class="border bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
	>
		<figure class="flex flex-col place-content-center justify-center w-full">
			<img
				src={book.cover_url}
				class="object-cover w-100px book"
				alt="Invalid"
				loading="lazy"
				onerror={(e) => {
					if (e.currentTarget.getAttribute('data-reloaded') !== 'true') {
						e.currentTarget.setAttribute('data-reloaded', 'true');
						e.currentTarget.setAttribute('src', '/book_placeholder/cover.png');
					}
				}}
			/>

			<figcaption>
				<p
					class="flex flex-nowrap justify-center text-md md:text-xl h-fit break-all truncate"
				>
					<span class="w-100px md:w-9/10 truncate px-2 text-center">
						{book.title}
					</span>
				</p>
			</figcaption>
		</figure>
		<span
			class="flex items-center text-[0.8em] text-green-800 flex-nowrap w-96% self-center truncate capitalize"
		>
			<p class="truncate mr-1">
				#{book.tags[0]}
			</p>
			<p class="text-amber-800 truncate w-1/2">#{book.category}</p>
		</span>

		<!-- <span class="self-start ml-4 text-sm truncate inline-block">
			By.{book.author_name}
		</span> -->
		<span
			class="text-gray-500 text-sm self-start capitalize flex gap-2 justify-center w-full"
		>
			<div>
				👍
				{formatNumber(book.like_count)}
			</div>
			<span class="flex">
				📄
				<Tooltip
					text={book.language !== 'English'
						? 'Character Count'
						: 'Approx.Word Count'}
					let:props
				>
					<p use:props.action {...props}>
						{book.language === 'English'
							? formatNumber(WordCountApprox(book.character_count))
							: formatNumber(book.character_count)}
					</p>
				</Tooltip>
			</span>
		</span>

		<div class="py-1 w-full">
			<div class="flex flex-col justify-center w-full space-x-2">
				<p class="text-center">
					<Star class="inline" size={10} />
					{book.average_rating}/100
				</p>
				<hr />
				<a href="/book/{book.id}" class="hover:underline font-bold text-center">
					Read
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.inner {
		box-shadow:
			rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset,
			rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
	}
</style>
