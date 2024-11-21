import { onMount } from 'svelte';

export function isMobile() {
	let s = $state(false);
	onMount(() => {
		const regex =
			/Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		const isMobile = regex.test(navigator.userAgent);
		if (isMobile) s = isMobile;
	});

	return () => s;
}
