<script lang="ts">
	let { data, href }: { data: string[]; href: string[] } = $props();
</script>

<nav class="flex" aria-label="Breadcrumb">
	<ol class="inline-flex items-center space-x-1 md:space-x-3">
		{#each data as item, index}
			<li class="inline-flex items-center">
				<a
					href={href[index]}
					class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
				>
					{item}
					<svg
						class="w-3 h-3 text-gray-400 mx-1"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 6 10"
						class:hidden={index == data.length - 1}
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m1 9 4-4-4-4"
						/>
					</svg>
				</a>
			</li>
		{/each}
	</ol>
</nav>
