<script lang="ts">
	import { user } from '$lib/state/runes.svelte';
	import Button from '$lib/components/button.svelte';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { log_out } from '$lib/queries';
	let { class: classes }: { class?: string } = $props();
</script>

{#if user.authStatus == 'signed out' || user.authStatus == 'anon'}
	<Button
		variant="ghost"
		class={classes + ' standout'}
		onclick={() => (AuthDialog.open = true)}
	>
		Sign in
	</Button>
{/if}
{#if user.authStatus == 'signed in'}
	<Button
		variant="ghost"
		onclick={log_out}
		class={user.authStatus == 'signed in'
			? classes + ' standout'
			: 'hidden  ' + classes + ' standout'}
	>
		Log Out
	</Button>
{/if}
