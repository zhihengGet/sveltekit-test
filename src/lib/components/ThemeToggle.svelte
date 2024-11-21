<script lang="ts" module>
	export function toggleTheme(off: boolean) {
		if (off === true) {
			document.documentElement.classList.remove('dark');
		} else if (off === false) {
			document.documentElement.classList.add('dark');
		} else document.documentElement.classList.toggle('dark');
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, untrack } from 'svelte';
	let { enable = $bindable(false) }: { enable?: boolean } = $props();
	let brightness = $state(55);
	let sepia = $state(20);
	let contrast = $state(90);
	let grayscale = $state(10);
	// csr only component
	let dark = $state(false);
	let setting = $derived({
		brightness: brightness,
		contrast: contrast,
		sepia: sepia,
		grayscale: grayscale
	});
	let dark_reader = $state();
	let mode = $derived(dark ? 'theme-toggle--toggled' : '');
	$effect(() => {
		dark = enable;
	});
	$effect(() => {
		enable = dark;
	});
	/* $effect(() => {
		if (dark_reader) {
			if (dark) {
				dark_reader?.enable({
					brightness: brightness,
					contrast: contrast,
					sepia: sepia
				});
			} else {
				dark_reader?.disable();
			}
		}
	}); */
	onMount(async () => {
		if (browser && typeof window !== 'undefined') {
			//	const darkreader = await import('darkreader');
			//	dark_reader = darkreader;
			//darkreader.setFetchMethod((url) => fetch(url));
			//darkreader.auto(false);
			// Enable when the system color scheme is dark.

			if (
				localStorage.getItem('dark') === 'true' ||
				(localStorage.getItem('dark') === undefined &&
					window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				//debugger;

				document.documentElement.classList.add('dark');
				dark = true;
			} else {
				document.documentElement.classList.remove('dark');
				dark = false;
			}
			/* if (dark)
				darkreader.enable({
					brightness: brightness,
					contrast: contrast,
					sepia: sepia
				}); */
		}
	});
	/* const {
		elements: { root, range, thumbs },
		states: { value }
	} = createSlider({
		defaultValue: [100],
		min: 0,
		max: 100,
		step: 1
	}); */

	async function handleSwitchDarkMode() {
		dark = !dark;
		/* const darkreader = await import('darkreader');
		const { enable, disable } = darkreader;
		
		if (dark) {
			enable(setting);
		} else {
			disable();
		} */
		dark
			? document.documentElement.classList.add('dark')
			: document.documentElement.classList.remove('dark');

		!dark && localStorage.setItem('dark', 'false');
		dark && localStorage.setItem('dark', 'true');
	}
</script>

<!-- 	<div class="flex items-center space-x-2">
				<Moon class="h-4 w-4" />
				<Switch checked={$darkMode} on:change={toggleDarkMode} />
				<Sun class="h-4 w-4" />
			</div> -->
<button
	class="theme-toggle {mode} inline"
	type="button"
	title="Toggle theme"
	aria-label="Toggle theme"
	onclick={handleSwitchDarkMode}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		width="1.5em"
		height="1.6em"
		fill="currentColor"
		stroke-linecap="round"
		class="theme-toggle__classic bg-transparent"
		viewBox="0 0 32 32"
	>
		<clipPath id="theme-toggle__classic__cutout">
			<path d="M0-5h30a1 1 0 0 0 9 13v24H0Z" />
		</clipPath>
		<g clip-path="url(#theme-toggle__classic__cutout)">
			<circle cx="16" cy="16" r="9.34" />
			<g stroke="currentColor" stroke-width="1.5">
				<path d="M16 5.5v-4" />
				<path d="M16 30.5v-4" />
				<path d="M1.5 16h4" />
				<path d="M26.5 16h4" />
				<path d="m23.4 8.6 2.8-2.8" />
				<path d="m5.7 26.3 2.9-2.9" />
				<path d="m5.8 5.8 2.8 2.8" />
				<path d="m23.4 23.4 2.9 2.9" />
			</g>
		</g>
	</svg>
</button>
