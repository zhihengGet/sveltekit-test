<script lang="ts">
	import { page } from '$app/stores';
	import { headerControl } from '$lib/state/ui.svelte';
	headerControl.toggle;
</script>

<!-- <h1>{$page?.error?.message}</h1> -->

{#if $page.status == 404}
	<div class="flex flex-col items-center justify-center min-h-[80vh] space-y-2">
		<div class="space-y-2 text-center">
			<h1
				class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
			>
				Oops! Page Not Found
			</h1>
			<p
				class="max-w-[600px] text-gray-500 md:text-xl/relaxed xl:text-base/relaxed dark:text-gray-400"
			>
				The page you are looking for might have been removed had its name
				changed or is temporarily unavailable.
			</p>
		</div>
		<a
			class="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
			href="/#"
		>
			Go Back Home
		</a>
		<a
			class="inline-flex h-10 items-center justify-center rounded-md bg-gray-50 px-4 text-sm font-medium text-gray-950 shadow-sm transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-950"
			href="https://www.reddit.com/r/forkread/"
			referrerpolicy="no-referrer"
			rel="ugc"
		>
			Contact Support
		</a>
	</div>

	<style>
		h1 {
			font-family: 'Manrope', sans-serif;
			--font-sans: 'Manrope';
		}
	</style>
{/if}
<!--
// v0 by Vercel.
// https://v0.dev/t/kNEL2Hb6c3T
-->
{#if $page.status != 404}
	<style>
		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			font-family: 'Libre Franklin', sans-serif;
			--font-sans: 'Libre Franklin';
		}
	</style>
	<style>
		body {
			font-family: 'Judson', serif;
			--font-serif: 'Judson';
		}
	</style>
	<div
		class="flex flex-col items-center justify-center min-h-[600px] py-12 text-center"
	>
		<div class="space-y-2">
			<h1 class="text-2xl font-bold tracking-tighter sm:text-5xl md:text-3xl">
				Error Occurred
			</h1>
			<p
				class="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
			>
				{$page.error?.message}
				{$page.error?.errorId}
			</p>
		</div>
		<div
			class="flex flex-col gap-2 min-[400px]:flex-row mx-auto max-w-sm items-center justify-center"
		>
			<!-- <form class="flex flex-1">
				<input
					class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm flex-1 grid w-full gap-1"
					placeholder="Enter your email"
					type="email"
				/>
				<button
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 h-10 w-20"
					type="submit"
				>
					Subscribe
				</button>
			</form> -->
			<a
				class="inline-flex h-10 items-center rounded-md border border-gray-200 border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
				href="/"
			>
				Go Back
			</a>
		</div>
	</div>
{/if}
