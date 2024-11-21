<script lang="ts">
	export let type: 'star-and-crescent' | 'glowing-star' | 'star' = 'star';
</script>

{#if type == 'star-and-crescent'}
	<span class="i-openmoji:star text-2xl"></span>
{/if}

{#if type == 'glowing-star'}
	<span class="i-twemoji:glowing-star text-2xl"></span>
{/if}

{#if type == 'star'}
	<span class="i-noto:star text-xl border-teal-100"></span>
{/if}
