<script lang="ts">
	function useInfiniteScroll({
		loading,
		hasNextPage,
		onLoadMore,
		rootMargin,
		disabled
	}) {
		let el = $state();
		$effect(() => {
			let observer = new IntersectionObserver(
				(entries) => {
					console.log(hasNextPage);
					entries.forEach((entry) => {
						const intersecting = entry.isIntersecting;
					});
				},
				{
					threshold: 0.2,
					rootMargin: rootMargin
				}
			);
			if (el) observer.observe(el);

			return () => observer.unobserve(el);
		});

		return (node: Element) => {
			console.log('sett');
			el = node;
		};
	}
	const s = $state({ hasNextPage: false });
	const a = useInfiniteScroll(s);
	import { page } from '$app/stores';
	import { headerControl } from '$lib/state/ui.svelte';

	headerControl.toggle();
</script>

<div class="app">
	<button
		onclick={() => {
			console.log('updated', s.hasNextPage);
			s.hasNextPage != s.hasNextPage;
		}}
	>
		update {s.hasNextPage}
	</button>
	<div class="w-100 h-100 bg-green p-5 overflow-auto">
		<div class="w-full h-500 bg-green-100"></div>
		<button use:a>load</button>
	</div>
</div>
