import { flushSync } from 'svelte';
/* mutation observer based */
export function createMutationObserver(
	targetFn: () => {
		targetNode?: HTMLElement;
		action: (target: HTMLElement) => void;
	}
) {
	// Select the node that will be observed for mutations
	let target = $derived(() => targetFn().targetNode);
	// Options for the observer (which mutations to observe)
	const config = {
		attributes: false,
		childList: true,
		subtree: true
		//characterData: true
	};
	$effect(() => {
		if (!target()) return () => {};
		// Create an observer instance linked to the callback function
		const observer = new MutationObserver((mutationList, observer) => {
			for (const mutation of mutationList) {
				//console.log('mutationList');
				if (mutation.type === 'childList') {
					//console.log('A child node has been added or removed.');
					targetFn().action(target());
					/* let top = target().scrollHeight - target().clientHeight;
	
					target().scroll({ top: target().scrollHeight - target().clientHeight });
					prev_top = true; */
				} else if (mutation.type === 'attributes') {
					//console.log(`The ${mutation.attributeName} attribute was modified.`);
				}
			}
		});
		// Start observing the target node for configured mutations
		observer.observe(target(), config);

		// Later, you can stop observing
		return () => observer.disconnect();
	});
}
import { useEventListener } from 'runed';

/* scroll event based  */
export function useScrollListener(target: () => HTMLElement | undefined) {
	let lastScrollTop = 0;
	let stats = $state({ up: false, down: false, hasScrolledUp: false });
	useEventListener(
		() => target(),
		'scroll',
		(e) => {
			let target: HTMLElement = e.target;
			const currentScrollTop = target.scrollTop;
			if (currentScrollTop >= 600 && currentScrollTop < lastScrollTop - 10) {
				// User scrolled up
				console.log('Scrolled up', currentScrollTop, lastScrollTop);
				stats.up = true;
				stats.down = false;
				stats.hasScrolledUp = true;
			} else {
				stats.up = false;
				stats.down = true;
			}
			lastScrollTop = currentScrollTop;
		}
	);

	return () => stats;
}

/*  */
/* problem with this is that MD is rendered in async way, flushSync is called before async MD is rendered  */
/* this cause toBottom to not move to bottom completely */
export let PortalBottom = (
	args: () => { target: HTMLElement; enable: boolean }
) => {
	// id of the chat container ---------- ^^^
	const data = args();
	if (data.target) {
		/* before ui render the message */
		const atBottom =
			data.target.scrollTop >=
			data.target.scrollHeight - data.target.offsetHeight - 80;
		console.log(
			'before sync',
			atBottom,
			data.target.scrollTop,
			data.target.scrollHeight,
			data.target.offsetHeight
		);
		/* wait for ui to sync does not wait for async*/
		flushSync(() => {
			console.log(
				'flushSync',
				data.target?.children.item(data.target?.children.length - 2)?.innerHTML
			);
			// id of the chat container ---------- ^^^
			if (data.target) {
				const info = {
					scrollTop: data.target.scrollTop,
					scrollHeight: data.target.scrollHeight,
					offsetHeight: data.target.offsetHeight
				};
				console.log('After sync', atBottom, info);
				//if (atBottom) {
				data.target.scrollTop = data.target.scrollHeight; // - feedEl.clientHeight;
				//anchor.scrollIntoView({ behavior: 'smooth', block: 'end' });
				//}
				console.log('scrolling to bottom', info);
			}
		});
	}
};
