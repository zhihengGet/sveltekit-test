import { cssControl } from '$lib/state/css.svelte';
import { onMount } from 'svelte';

export function useMediaQuery(
	mediaQuerys: string,
	defaultValue: boolean = false
) {
	const s = $state({ match: defaultValue });
	function listener(e: MediaQueryListEvent) {
		// Check if the media query is true
		console.log('checking query');
		if (e.matches) {
			// Then log the following message to the console
			//console.log('Media Query Matched!');
			s.match = true;
		} else {
			s.match = false;
		}
	}
	onMount(() => {
		const mediaQuery = window.matchMedia(mediaQuerys);
		s.match = mediaQuery.matches;

		mediaQuery.addEventListener('change', listener);

		return () => mediaQuery.removeEventListener('change', listener);
	});

	return s;
}
export function useIsMobile() {
	const s = useMediaQuery('(max-width: 768px)', cssControl.mobile);
	return s;
}
