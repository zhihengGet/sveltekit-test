import { onMount } from 'svelte';

export function useIsBottom(element: HTMLElement) {
	const s = $state<{
		isBottom: boolean;
		isTop: boolean;
		isScrolling: boolean;
		direction: -1 | 1 | null;
	}>({
		isBottom: false,
		isTop: false,
		isScrolling: false,
		direction: null
	});

	onMount(() => {
		let el = element || document.documentElement;
		let prevScroll = el.scrollTop;

		const act = function () {
			let st = el.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
			if (st > prevScroll) {
				s.direction = -1;
				// down scroll code
			} else if (st < prevScroll) {
				s.direction = 1;
				// up
			}
			// else was horizontal scroll
			prevScroll = st <= 0 ? 0 : st; // For Mobile or negative scrolling
			if (el.scrollTop == 0) {
				//user is at the top of the page; no need to show the back to top button
				s.isTop = true;
			} else {
				s.isTop = false;
			}

			s.isScrolling = true;
		};
		window.addEventListener('scroll', act);
		function e() {
			if (Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1) {
				// you're at the bottom of the page
				s.isBottom = true;
			} else {
				s.isBottom = false;
			}
			s.isScrolling = false;
		}
		window.addEventListener('scrollend', e);

		return () => {
			window.removeEventListener('scroll', act);
			window.removeEventListener('scrollend', e);
		};
	});
	return s;
}
