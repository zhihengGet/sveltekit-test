<script lang="ts">
	import { client } from '$lib/queries/api';
	import localforage from 'localforage';
	import { isNil } from 'lodash-es';
	import { onMount } from 'svelte';
	let { bid }: { bid: any } = $props();
	//TODO use redis or server side session to avoid spamming
	// this is for author only so might not needed?
	onMount(async () => {
		const referrer = document.referrer;
		if (!referrer) return;
		const KEY = 'referer-' + referrer;
		const exp: number = (await localforage.getItem(KEY)) ?? 0;
		const day = 1000 * 60 * 60 * 24;
		if (
			exp + day > Date.now() ||
			isNil(bid) ||
			referrer.includes(window.location.hostname) === true
		) {
			// skip
		} else {
			// update referer stats
			// only care about top 1000 URL
			// bottom referrer will be replaced with newcomer
			await client.rest.api.books.stats.referrer
				.$post({
					json: { book_id: bid, referrer }
				})
				.catch((e) => console.error(e));
			/* fetch('/api/update_ref', {
				method: 'POST',
				body: JSON.stringify({ referrer, bid })
			}).catch((e) => console.error(e)); */
			await localforage.setItem(KEY, Date.now());
		}
	});
</script>
