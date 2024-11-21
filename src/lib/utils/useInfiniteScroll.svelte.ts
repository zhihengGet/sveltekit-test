export type UseInfiniteScrollHookArgs = {
	// Some sort of "is fetching" info of the request.
	loading: () => boolean;
	// If the list has more items to load.
	hasNextPage: () => boolean;
	// The callback function to execute when the 'onLoadMore' is triggered.
	// eslint-disable-next-line no-undef
	onLoadMore: VoidFunction;
	// Flag to stop infinite scrolling. Can be used in case of an error etc too.
	disabled?: () => boolean;
	// How long it should wait before triggering 'onLoadMore'.
	delayInMs?: number;
	rootMargin?: number;
};

export function useInfiniteScroll({
	loading,
	hasNextPage,
	onLoadMore,
	rootMargin,
	disabled
}: UseInfiniteScrollHookArgs) {
	let el = $state();
	$effect(() => {
		let t: Timer;
		let observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const intersecting = entry.isIntersecting;
					console.log('params', loading, hasNextPage);
					if (intersecting && hasNextPage() && !loading() && !disabled?.()) {
						if (t) clearTimeout(t);
						t = setTimeout(() => {
							onLoadMore(); //
						}, 200);
					}
				});
			},
			{
				threshold: 0.2,
				rootMargin: '5px'
			}
		);
		if (el) {
			observer.observe(el);
			return () => observer.unobserve(el);
		}
	});

	return (node: Element) => {
		el = node;
	};
}
