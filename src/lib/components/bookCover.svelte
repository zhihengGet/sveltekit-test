<script lang="ts">
	import type { book } from '$lib/types';

	export let book: book;
</script>

<!-- cover will match &.div size -->
<a
	class="book-container"
	style="--book-cover:url({book.cover_url})"
	href="/read/{book.id}"
	target="_blank"
	rel="noreferrer noopener"
>
	<div class="book">
		<!-- front page -->
		<div class="front rounded-s-sm" />
		<div class="page" />
		<!-- spine -->
		<div class="left-side">
			<h2>
				<span class="author">George Orwell</span>
				<span class="year">1984</span>
			</h2>
		</div>
		<!-- backpage -->
		<div class="back">
			<h2>
				<span>George Orwell</span>
				<span>Born in 1984</span>
			</h2>
		</div>
	</div>
</a>

<style>
	.book-container {
		display: flex;
		align-items: center;
		justify-content: center;
		perspective: 600px;
		/* border: 5px solid red; */
	}

	@keyframes initAnimation {
		0% {
			transform: rotateY(-24deg);
		}
		100% {
			transform: rotateY(-21deg);
		}
	}

	.book {
		width: 200px;
		height: 275px;
		position: relative;
		transform-style: preserve-3d;
		transform: rotateY(-21deg);
		transition: 2s ease;
		animation: 1s ease 0s 1 initAnimation;
	}

	.book:hover {
		transform: rotateY(20deg);
	}

	.front {
		position: absolute;
		top: 0;
		left: 0;
		background-color: rgb(140, 252, 118);
		width: 200px;
		height: 275px;
		transform: translateZ(25px);
		border-radius: 0 2px 2px 0;
		box-shadow: 5px 5px 20px #666;
		background-image: linear-gradient(
				90deg,
				rgba(224, 224, 224, 0) 2%,
				rgba(156, 155, 155, 0.5) 4%,
				rgba(30, 27, 27, 0) 8%
			),
			var(--book-cover);
		background-repeat: no-repeat;
		background-size: cover;
		box-shadow: inset 4px 0 10px rgba(0, 0, 0, 0.1);
	}
	/* page */
	.page {
		position: absolute;
		content: ' ';
		background-color: blue;
		left: 0;
		top: 0px;
		width: 48px;
		height: 275px;
		transform: translateX(175px) rotateY(90deg);
		background: linear-gradient(
			90deg,
			#fff 0%,
			#f9f9f9 5%,
			#fff 10%,
			#f9f9f9 15%,
			#fff 20%,
			#f9f9f9 25%,
			#fff 30%,
			#f9f9f9 35%,
			#fff 40%,
			#f9f9f9 45%,
			#fff 50%,
			#f9f9f9 55%,
			#fff 60%,
			#f9f9f9 65%,
			#fff 70%,
			#f9f9f9 75%,
			#fff 80%,
			#f9f9f9 85%,
			#fff 90%,
			#f9f9f9 95%,
			#fff 100%
		);
	}
	/* back page */
	.back {
		position: absolute;
		top: 0;
		left: 0;
		background-image: var(--book-cover);
		width: 200px;
		height: 275px;
		transform: translateZ(-25px);
		background-color: #0054f0;
		border-radius: 0 2px 2px 0;
	}
	.back h2 {
		transform: rotateY(-200deg);
	} /* book spine */
	.left-side {
		width: 52px;
		height: 275px;
		right: 0;

		background-color: rgba(232, 229, 234);
		overflow: hidden;
		/* 	-webkit-transform: rotate3d(0, 1, 0, -90deg);
		-moz-transform: rotate3d(0, 1, 0, -90deg); */
		transform: translateX(-25px) rotate3d(0, 1, 0, -90deg);
		background-image: linear-gradient(
				90deg,
				rgba(224, 224, 224, 0.1) 0%,
				rgba(224, 224, 224, 0.3) 25%,
				rgb(179, 176, 176),
				54%,
				rgba(224, 224, 224, 0.3) 87%,
				rgba(224, 224, 224, 0.1) 100%
			),
			var(--book-cover);

		background-size: contain;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		flex-wrap: wrap;
	}
	.author,
	.year {
		text-orientation: sideways-right;
		writing-mode: vertical-lr;
		font-size: small;
	}
</style>
