<script lang="ts">
	import { dev } from '$app/environment';
	import { PUBLIC_TURNSTILE } from '$env/static/public';
	import type { TurnstileObject } from 'turnstile-types';

	let {
		cb,
		token = $bindable(''),
		appearance = false
	}: {
		cb?: (token: string) => any;
		token?: string;
		appearance?: boolean;
	} = $props();
	let scriptNode: HTMLElement | null = $state(null);
	let ready = $state(false);
	let error = $state('');
	let widget = $state();
	let cfObj: TurnstileObject = $state();
	export { ready };
	export function gen() {
		token = '';
		cfObj.reset(widget);
	}
	$effect(() => {
		let cleanup = () => {};
		if (scriptNode && !widget) {
			const script = document.createElement('script');
			script.src =
				'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.onload = () => {
				const cf = window.turnstile as TurnstileObject;
				cfObj = cf;
				if (!cf || !scriptNode) {
					console.log('error with cf');
					error = 'Failed to load Captcha;Please refresh';
					return;
				}

				const widegetId = cf.render(scriptNode, {
					sitekey: dev ? '3x00000000000000000000FF' : PUBLIC_TURNSTILE,
					size: 'normal',
					callback: (t) => {
						token = t;
						cb?.(t);
					},
					'expired-callback': () => {
						token = '';
						//cf.reset(widegetId);
					}
				});
				widget = widegetId;
				ready = true;
				cleanup = () => {
					console.log('clearing up turnstile', widegetId);
					widget = undefined;
					cf.remove(scriptNode);
				};
			};
			document.head.appendChild(script);
		}
		return cleanup;
	});
</script>

<!-- <svelte:head>
	<script
		src="https://js.stripe.com/v3/"
		on:load={() => console.log('script:load')}
	></script>
	<script
		crossorigin="anonymous"
		fetchpriority="high"
		src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
		onload={() => {
			ready = true;
			console.log('script:load cf');
		}}
	></script>
</svelte:head> -->

<div bind:this={scriptNode} class="cf-turnstile"></div>
<!-- <link
	rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.1/css/bootstrap.min.css"
	integrity="sha512-siwe/oXMhSjGCwLn+scraPOWrJxHlUgMBMZXdPe2Tnk3I0x3ESCoLz7WZ5NTH6SZrywMY+PB1cjyqJ5jAluCOg=="
	crossorigin="anonymous"
	referrerpolicy="no-referrer"
/> -->
<!-- <link
	rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.9.1/font/bootstrap-icons.min.css"
	integrity="sha512-5PV92qsds/16vyYIJo3T/As4m2d8b6oWYfoqV+vtizRB6KhF1F9kYzWzQmsO6T3z3QG2Xdhrx7FQ+5R1LiQdUA=="
	crossorigin="anonymous"
	referrerpolicy="no-referrer"
/> -->
{error}
