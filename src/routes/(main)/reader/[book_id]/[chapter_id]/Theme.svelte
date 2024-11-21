<script lang="ts">
	import { darkReader } from '$lib/data/filter/readerPersonalize';
	import Drawer from '$components/Drawer.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import * as Themes from '$lib/data/filter/readerPersonalize';
	import { keys } from '$lib/utils/getKeys';
	import localforage from 'localforage';
	import { debounce, merge, startCase, isEqual } from 'lodash-es';
	import { onDestroy, onMount, untrack } from 'svelte';
	import {
		ReaderTheme,
		ReaderThemeDefault,
		currentComment
	} from './store.svelte';
	import { useGetUserBookTheme } from '$lib/queries/user/getUser';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		useUpdateUserSettings,
		useUpdateUserBookTheme
	} from '$lib/queries/user/mutate/userSetting';
	import { user } from '$lib/state/runes.svelte';
	import { fade } from 'svelte/transition';
	import type { ID } from '$lib/types';
	let { open = $bindable(false), book_id }: { open: boolean; book_id: ID } =
		$props();


	const options = Themes.options;
	const db_theme = useGetUserBookTheme(() => {
		return {
			book_id: book_id
		};
	});
	const themes = Themes.theme;
	const key = keys(Themes.options).filter((v) => v != 'width');
	const updateTheme = useUpdateUserBookTheme();
	const deb = debounce(() => {
		//console.log('deb', Date.now(), ReaderTheme, $state.snapshot(ReaderTheme));
		if (book_id) {
			updateTheme.mutate({
				book_theme: $state.snapshot(ReaderTheme),
				book_id: book_id
			});
		}
	}, 200);
	enum PRIO {
		LOCAL,
		DB,
		USER
	}
	let status: number = $state(PRIO.LOCAL);
	function updatePrio(curr: PRIO = PRIO.USER) {
		if (curr > status) status = Math.max(status, curr);
	}

	$effect.pre(() => {
		// from remote
		if (status <= PRIO.DB) {
			const old = db_theme;
			console.log('kv result', old.data);
			if (db_theme.isSuccess) {
				untrack(() => {
					Object.assign(ReaderTheme, $state.snapshot(old.data));
				});
			}
		}
	});
	let defaultTheme = ReaderThemeDefault;
	onMount(async () => {
		const old = await localforage.getItem('theme');
		console.log('loaded from localforage', old);
		if (old) Object.assign(ReaderTheme, old);
		if (old) add(ReaderTheme.theme);
		updatePrio(PRIO.LOCAL);
	});
	$effect(() => {
		// should only be called if readerTheme updated
		if ({ ...ReaderTheme } && status >= PRIO.USER) {
			untrack(() => {
				localforage
					.setItem('theme', $state.snapshot(ReaderTheme))
					.catch((e) => console.error(e));
				console.log('theme updated');
				if (user.authStatus == 'signed in') deb();
			});
		}
	});
	let invLevel: number | null = $state(null);
	function toggleClass(theme: string) {
		document.documentElement?.classList.toggle(theme);
	}
	function add(theme: string) {
		document.documentElement?.classList.add(theme);
	}
	function remove(theme: string) {
		document.documentElement?.classList.remove(theme);
	}
	$effect.pre(() => {
		if (invLevel == undefined) {
			let num = parseInt(
				ReaderTheme.darken?.split?.('(')[1]?.split(')')[0] ?? '0'
			);
			invLevel = num ? num : 1;
		}
	});
	/* async function logFontData() {
		try {
			const availableFonts = await window.queryLocalFonts();
			for (const fontData of availableFonts) {
				console.log(fontData.postscriptName);
				console.log(fontData.fullName);
				console.log(fontData.family);
				console.log(fontData.style);
			}
		} catch (err) {
			console.error(err.name, err.message);
		}
	} */
	/* onMount(async () => {
		const availableFonts: { family: string }[] =
			await window?.queryLocalFonts();
		// check if a font is valid
		const families = availableFonts.map((v) => v.family);
	}); */
</script>

<Drawer
	title="Theme Setting"
	description="Change the theme of the reader"
	class="flex flex-wrap gap-1 flex-col p-4"
	style={'background:' + ReaderTheme.backgroundColor}
	bind:open
>
	{#snippet Overlay()}
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed inset-0 z-50 bg-black/80"
		/>
	{/snippet}
	<div>
		<b class="text-sm flex items-center text-blue mix-blend-lighten">
			<!-- use darkreader ...  -->
			<!-- 	<button
				class="ml-2"
				onclick={() => {
					updatePrio(PRIO.USER);
					ReaderTheme.darken = 'invert(1)';
				}}
			>
				Darken {}
			</button> -->
			<!-- <button
				class="mx-1"
				onclick={() => {
					updatePrio(PRIO.USER);
					invLevel -= 0.1;
					ReaderTheme.darken = 'invert(' + invLevel + ')';
				}}
			>
				-
			</button>
			<button
				class="mx-1"
				onclick={() => {
					updatePrio(PRIO.USER);
					invLevel += 0.1;
					ReaderTheme.darken = 'invert(' + invLevel + ')';
				}}
			>
				+
			</button> -->
		</b>
	</div>
	<div>
		<b class="text-sm color-neutral" style={'color:' + ReaderTheme.color}>
			Preset:
		</b>
		{#each keys(themes) as theme}
			<button
				onclick={() => {
					remove(ReaderTheme.theme);
					ReaderTheme.theme = theme;
					add(ReaderTheme.theme);
					merge(ReaderTheme, themes[theme]);
					ReaderTheme['darken'] = darkReader[theme] ? 'invert(1)' : 'invert(0)';
					updatePrio(PRIO.USER);
				}}
			>
				<Badge
					variant="secondary"
					style={'color:' +
						ReaderTheme.color +
						';background-color:' +
						ReaderTheme.backgroundColor}
					class="capitalize {ReaderTheme.theme === theme
						? 'text-neutral!'
						: ''}"
				>
					{theme}
				</Badge>
			</button>
		{/each}
		<button
			onclick={() => {
				/* for (let x in ReaderTheme) {
					ReaderTheme[x] ;
				} */
				Object.assign(ReaderTheme, defaultTheme);
				updatePrio(PRIO.USER);
			}}
		>
			<Badge
				variant="secondary"
				style={'color:' + ReaderTheme.color + ';background-color:green'}
			>
				Default
			</Badge>
		</button>
	</div>

	<hr class="box-content mt-2" />
	<!-- 	<div>
		Infinity Scroll:
		<Checkbox bind:checked={ReaderTheme.scroll} />
	</div> -->
	<!-- {JSON.stringify(ReaderTheme)} -->
	<div class="flex flex-col gap-1">
		{#each key as option}
			<span class="flex flex-wrap flex-col p-1 shadow-blue">
				<div
					class="font-600 mb-1 text-sm color-neutral!"
					style={'color:' + ReaderTheme.color}
				>
					{startCase(option)}
				</div>
				<span>
					{#each keys(options[option]) as label}
						{@const isEqual = ReaderTheme[option] === options[option][label]}

						<button
							class:text-blue={ReaderTheme[option] === options[option][label]}
							onclick={() => {
								let curr = ReaderTheme[option];

								if (curr === options[option][label]) {
									ReaderTheme[option] = 'inherit';
								} else ReaderTheme[option] = options[option][label];
								updatePrio(PRIO.USER);
							}}
						>
							<Badge
								variant="secondary"
								style={'color:' +
									ReaderTheme.color +
									';background-color:' +
									(isEqual ? '#FFE4C4' : ReaderTheme.backgroundColor)}
								class={isEqual ? 'text-amber-400' : ''}
							>
								{label}
							</Badge>
						</button>
					{/each}
				</span>
			</span>
		{/each}
	</div>
	<hr class="box-content mt-2" />
	<div>
		<div class="text-sm font-bold">Actions:</div>
		<button
			class="select-none rounded-lg bg-neutral-900 py-1 px-2 text-center align-middle text-xs text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
			onclick={() => {
				updatePrio(PRIO.USER);
				ReaderTheme.commentsOp = ReaderTheme.commentsOp == 1 ? 0 : 1;
			}}
		>
			{ReaderTheme.commentsOp == 1 ? 'Hide' : 'Show'} Comments
		</button>
		<!-- 	<button
			class="select-none rounded-lg bg-gray-800 py-2 px-2 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
			onclick={() => {
				ReaderTheme.skipVersions = !ReaderTheme.skipVersions;
			}}
			disabled={true}
		>
			{ReaderTheme.skipVersions
				? 'Show All Chapters'
				: 'Skip Mini-Chapters/MinorVersion 🚧'}
		</button> -->
	</div>
	<!-- 	
		<div>
			<div class="text-gray text-sm">Background color</div>
			<input type="color" bind:value={ReaderTheme.backgroundColor} />
		</div>
		<div>
			container color
			<input type="color" bind:value={ReaderTheme.containerBackgroundColor} />
		</div>
		<div>
			Text Color
			<input type="color" bind:value={ReaderTheme.color} />
		</div> 
	-->
</Drawer>

<!-- <style>
	.back {
		position: fixed;
		bottom: 10%;
		right: -5px;
		font-size: x-large;
		opacity: 50%;
	}
	.back:hover {
		opacity: 100%;
	}
</style> -->
