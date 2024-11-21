<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		orientation?: 'vertical' | 'horizontal';
	}

	let { orientation = 'horizontal' }: Props = $props();
</script>

<Separator {orientation} />
