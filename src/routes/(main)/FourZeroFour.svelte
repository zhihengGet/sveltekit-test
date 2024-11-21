<!--
// v0 by Vercel.
// https://v0.dev/t/Y7C5eQyUAxo
-->
<script>
	let { children, title, description } = $props();
</script>

<div
	class="flex flex-col w-screen items-center justify-center min-h-screen py-12 md:flex-row md:gap-8 md:py-24"
>
	<div
		class="flex flex-col items-center justify-center gap-4 text-center md:items-start md:min-h-0"
	>
		<div class="flex items-center gap-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="w-10 h-10"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</svg>
			<div class="space-y-1 text-center md:text-left">
				<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
					Uh oh! Page not found.
				</h1>
				<p
					class="mx-auto max-w-[400px] text-gray-500 md:text-base/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
				>
					We can’t seem to find the page you’re looking for.
				</p>
			</div>
		</div>
	</div>
	<div
		class="grid gap-4 border-t w-fit min-h-[1px] py-4 md:border-t-0 md:gap-0 md:grid-cols-3 md:justify-center md:py-0"
	>
		<div
			class="flex flex-col items-center gap-2 text-center md:items-start md:gap-1 md:order-1"
		>
			<a class="text-sm font-medium text-gray-900 dark:text-gray-50" href="/">
				Home
			</a>
		</div>
	</div>
</div>
