<script lang="ts">
	import { formatNumber } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { count, children }: { count: number; children: Snippet } = $props();
</script>

<div class="inline-flex items-center justify-center relative h-fit">
	{@render children?.()}
	<div
		class="w-fit font-900 num z-10 h-fit w-fit text-[0.7em] translate-y-[-2px]"
	>
		{formatNumber(count)}
	</div>
</div>

<style>
	.num {
		top: -50%;
		right: -25%;
		font-weight: bolder;
		font-family: 'Courier New', Courier, monospace;
		background: rgb(136, 204, 255);

		background: linear-gradient(
			90deg,
			hsla(206, 91%, 66%, 1) 0%,
			hsla(190, 90%, 51%, 1) 100%
		);

		background: -moz-linear-gradient(
			90deg,
			hsla(206, 91%, 66%, 1) 0%,
			hsla(190, 90%, 51%, 1) 100%
		);

		background: -webkit-linear-gradient(
			90deg,
			hsla(206, 91%, 66%, 1) 0%,
			hsla(190, 90%, 51%, 1) 100%
		);

		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
