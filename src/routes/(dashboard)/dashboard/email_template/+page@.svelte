<script>
	import localforage from 'localforage';
	import { onMount } from 'svelte';

	let email = 'Empty';
	onMount(async () => {
		email = (await localforage.getItem('email_template')) ?? 'Empty...';
	});
</script>

{@html email}
