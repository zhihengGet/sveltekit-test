<script lang="ts">
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
	import Oval from '$lib/icons/loader/oval.svelte';
	import SocialAuth from './SocialAuth.svelte';

	let {
		cb,
		isReady = $bindable(false),
		type
	}: {
		cb: Function;
		isReady?: boolean;
		type: GsiButtonConfiguration['type'];
	} = $props();

	let state = { ready: false };
	//https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/google-one-tap/index.d.ts
	interface GsiButtonConfiguration {
		type?: 'standard' | 'icon';
		theme?: 'outline' | 'filled_blue' | 'filled_black';
		size?: 'large' | 'medium' | 'small';
		text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
		shape?: 'rectangular' | 'pill' | 'circle' | 'square';
		logo_alignment?: 'left' | 'center';
		width?: number;
		locale?: string;
	}
	function render(el: HTMLElement) {
		console.log('google script client render');
		const r = window.google.accounts.id.renderButton(el, {
			size: 'large',
			theme: 'outline',
			text: 'signin_with',
			shape: 'circle',
			type,
			width: type ? 1000 : 0
		} as GsiButtonConfiguration);
		isReady = true;
		state.ready = true;
	}
	const init = (el: HTMLElement) => {
		console.log('google script node loaded', window.google);
		if (window.google) {
			render(el);
			return;
		}
		const s = document.createElement('script');
		s.src = 'https://accounts.google.com/gsi/client';
		s.onload = () => {
			console.log(' script loaded ready to render');
			if (!window.google) return console.error('failed to load google');
			window.google.accounts.id.initialize({
				client_id: PUBLIC_GOOGLE_CLIENT_ID,
				callback: cb,
				use_fedcm_for_prompt: true
			});
			//	google.accounts.id.prompt();
			//const parent = document.getElementById('g_id_signin');
			render(el);
		};
		// insert if not there
		if (!window.google) document.head.append(s);
	};
</script>

{#snippet Google(cls)}
	<div
		use:init
		class="g_id_signin {cls}"
		data-type="standard"
		data-shape="pill"
		data-theme="outline"
		data-text="signin_with"
		data-size="large"
		data-logo_alignment="left"
	>
		<Oval />
	</div>
{/snippet}

{#snippet CustomRender()}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative"
		onclick={() => {
			if (isReady) google.accounts.id.prompt();
		}}
	>
		<SocialAuth iconSnippet={Icon} text="Google" />
		<div
			use:init
			class="g_id_signin opacity-1 absolute z-2 max-w-full"
			data-type="standard"
			data-shape="pill"
			data-theme="outline"
			data-text="signin_with"
			data-size="large"
			data-logo_alignment="left"
		></div>
		{#if !isReady && !state.ready}
			<Oval class="absolute" stroke="#121212" />
		{/if}
	</div>
{/snippet}

{#snippet Icon({ class: classname })}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Google"
		role="img"
		width={30}
		class="inline-block border-1 rounded-full"
		viewBox="0 0 512 512"
	>
		<path d="m0 0H512V512H0" fill="#fff" />
		<path
			fill="#34a853"
			d="m90 341a192 192 0 00296 59v-48h-62c-53 35-141 22-171-60"
		/>
		<path
			fill="#4285f4"
			d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
		/>
		<path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
		<path
			fill="#ea4335"
			d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
		/>
	</svg>
{/snippet}
{#if type === 'icon'}
	<div class="relative">
		<SocialAuth iconSnippet={Icon} />
		{@render Google('absolute top-0 left-0 opacity-1')}
	</div>
{:else}
	{@render CustomRender()}
{/if}
