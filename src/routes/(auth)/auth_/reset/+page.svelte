<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import Input from '$components/ui/input/input.svelte';
	import { AuthDialog } from '$lib/state/login.svelte';
	import { supabase } from '$lib/supabaseClient/client';

	AuthDialog.open = false;
	$effect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event == 'PASSWORD_RECOVERY') {
				const newPassword = prompt(
					'What would you like your new password to be?'
				);
				const { data, error } = await supabase.auth.updateUser({
					password: newPassword
				});

				if (data) alert('Password updated successfully!');
				if (error) alert('There was an error updating your password.');
			}
		});
	});
</script>

<!--
// v0 by Vercel.
// https://v0.dev/t/to4nyX3eMjq
-->
<!--
// v0 by Vercel.
// https://v0.dev/t/LqQFzRjDDcE
-->
<div
	class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
>
	<div class="max-w-md w-full space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Please reset your password</h1>
			<div><Input placeholder="enter new password" /></div>
			<button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
			>
				Reset
			</button>
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
