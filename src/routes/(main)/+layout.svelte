<script lang="ts">
	import { page } from '$app/stores';
	import HeaderBuilt from '$lib/composite/HeaderBuilt.svelte';
	import { random } from 'lodash-es';
	let { children } = $props();
	const art_id = random(6, 15);
	const art_id1 = random(16, 27);
</script>

<HeaderBuilt />
<svelte:head>
	<link
		rel="preload"
		as="image"
		href="/backgrounds/otherworldly_view.avif"
		type="image/avif"
	/>
	<link
		rel="preload"
		href="/backgrounds/horse.webp"
		type="image/webp"
		as="image"
	/>
	<link
		rel="preload"
		href="/backgrounds/cn_feel.avif"
		type="image/avif"
		as="image"
	/>
</svelte:head>

{#if $page.url.href.includes('reader') == false}
	<div
		class="helloww fixed absolute left-0 top-0 w-200 h-200 top_left z-[-1]"
	></div>

	<div
		class="helloww fixed absolute right-0 top-0 w-100 h-100 top_right z-[-1]"
	></div>
	<!-- 	<div
		class="helloww fixed absolute bottom-0 w-screen h-100 mid_bottom z-[-1]"
	></div> -->
	<div
		class="helloww fixed absolute bottom-0 right-0 w-220 h-200 right_bottom z-[-2] hidden md:block"
		style="--RightBottom: url(/backgrounds/test{art_id}.webp)"
	></div>
	<div
		class="helloww fixed absolute bottom-0 left-0 w-220 h-200 left_bottom z-[-2]"
		style="--leftBottom: url(/backgrounds/test{art_id1}.webp)"
	></div>
{/if}

{@render children()}
<HeaderBuilt top={false} />

<!-- add custom background -->

<style>
	.top_left {
		background: url('/backgrounds/otherworldly_view.avif') no-repeat;
		/* object-fit: cover; */
		background-size: contain, contain;
		mask-image: radial-gradient(
			farthest-side at left top,
			rgba(255, 255, 255, 1) 40%,
			rgba(117, 219, 239, 0) 80%,
			rgba(117, 219, 239, 0)
		);
	}
	.top_right {
		background: url('/backgrounds/horse.webp') no-repeat;
		background-size: cover, contain;
		background-position: center left;
		/* 	object-fit: fill; */
		mask-image: radial-gradient(
			ellipse 80% 110% at top right,
			rgba(255, 255, 255, 1) 10%,
			rgba(117, 219, 239, 0.8) 60%,
			rgba(117, 219, 239, 0.4) 90%,
			rgba(117, 219, 239, 0) 100%
		);
	}
	.mid_bottom {
		background: url('/backgrounds/cn_feel.avif') no-repeat;
		background-size: contain, contain;
		background-position: 50% 50%;
		/* 	object-fit: fill; */
		mask-image: radial-gradient(
			ellipse 10% 99% at 50% 100%,
			rgba(255, 255, 255, 1) 20%,
			rgba(255, 255, 255, 0.6) 40%,
			rgba(117, 219, 239, 0.1) 60%,
			rgba(117, 219, 239, 0)
		);
	}
	.right_bottom {
		background: var(--RightBottom) no-repeat;
		background-size: contain, contain;
		background-position: 100% 100%;
		mask-image: radial-gradient(
			ellipse 95% 80% at 100% 110%,
			rgba(255, 255, 255, 1) 20%,
			rgba(255, 255, 255, 0.8) 40%,
			rgba(117, 219, 239, 0.6) 60%,
			rgba(117, 219, 239, 0.1) 85%,
			rgba(117, 219, 239, 0) 90%
		);
	}
	.left_bottom {
		background: var(--leftBottom) no-repeat;
		background-size: contain, contain;
		background-position: 0% 100%;
		mask-image: radial-gradient(
			ellipse 45% 80% at 0% 110%,
			rgba(255, 255, 255, 1) 20%,
			rgba(255, 255, 255, 0.8) 40%,
			rgba(117, 219, 239, 0.6) 60%,
			rgba(117, 219, 239, 0.1) 85%,
			rgba(117, 219, 239, 0) 90%
		);
	}
	@media screen and (max-width: 600px) {
		.top_left,
		.mid_bottom {
			display: none;
		}
	}
</style>
