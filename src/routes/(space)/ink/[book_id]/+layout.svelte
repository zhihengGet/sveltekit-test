<script>
	import Header from '$components/Header.svelte';
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import ConfigToolbar from '../../ConfigToolbar.svelte';
	import Vocab from './WordBank.svelte';

	/* 	export let data; */
	/* 
	let y = 0; */
</script>

<!-- <svelte:window bind:scrollY={y} /> -->
<Vocab />
<Header class="flex items-center gap-5">
	<a href="/dashboard" slot="left" class="hover:text-amber">
		<!-- <p class="text-[24px]">back</p> -->
		<svg
			fill="#000000"
			version="1.1"
			baseProfile="tiny"
			width="24px"
			height="24px"
			viewBox="0 0 42 42"
			xml:space="preserve"
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
			<g
				id="SVGRepo_tracerCarrier"
				stroke-linecap="round"
				stroke-linejoin="round"
			></g>
			<g id="SVGRepo_iconCarrier">
				<polygon
					fill-rule="evenodd"
					points="31,38.32 13.391,21 31,3.68 28.279,1 8,21.01 28.279,41 "
				></polygon>
			</g>
		</svg>
	</a>
	<ThemeToggle slot="right" />
</Header>

<div class="flex justify-center"><ConfigToolbar /></div>

<slot />
