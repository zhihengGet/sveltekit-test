<!--
// v0 by Vercel.
// https://v0.dev/t/Y7C5eQyUAxo
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, description }: { children?: Snippet; description: string } =
		$props();
</script>

<div
	class="flex h-[100dvh] w-full flex-col items-center justify-center bg-neutral-100 px-4 text-center"
>
	<div class="relative mx-auto max-w-md">
		<div
			class="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 blur-3xl opacity-50"
		></div>

		<div
			class="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 blur-3xl opacity-50"
		></div>
		<div class="relative z-10 grid gap-4">
			<h1 class="text-5xl font-bold tracking-tighter">Error occurred</h1>
			{@render children?.()}
			<p class="text-lg font-medium text-neutral-100">{description}</p>
			<a
				class="inline-flex h-10 items-center justify-center rounded-md bg-gray-50 px-4 text-sm font-medium text-gray-950 shadow-sm transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-950"
				href="https://www.reddit.com/r/forkread/"
				referrerpolicy="no-referrer"
				rel="ugc"
			>
				Contact Support
			</a>
			<a
				class="inline-flex h-10 items-center justify-center rounded-md bg-gray-50 px-4 text-sm font-medium text-gray-950 shadow-sm transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-950"
				href="/"
				rel="ugc"
			>
				Home
			</a>
		</div>
	</div>
</div>
