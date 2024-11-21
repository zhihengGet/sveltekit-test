<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { AuthDialog } from '$lib/state/login.svelte';

	AuthDialog.open = false;
</script>

<div
	class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
>
	<div class="max-w-md w-full space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Confirming Email Failed</h1>
			<p class="text-gray-500 dark:text-gray-400">
				Sorry, we couldn't authenticate you. Please try again.[{new URLSearchParams(
					$page.url.search
				).get('msg')}]
			</p>
		</div>
		<div class="space-y-4">
			<a
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
				href="/"
			>
				Back to Home Page
			</a>
		</div>
	</div>
</div>
