<!--
// v0 by Vercel.
// https://v0.dev/t/Y7C5eQyUAxo
-->
<script>
	import { headerControl } from '$lib/state/ui.svelte';
	let { children } = $props();
	import Error from '../Error.svelte';
	import FourZeroFour from '../FourZeroFour.svelte';
	headerControl.toggle();
</script>

<Error description="hello  world">Unknown</Error>
<FourZeroFour description="hello  world">Unknown</FourZeroFour>
