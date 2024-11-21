<!--
// v0 by Vercel.
// https://v0.dev/t/TAzpTxihPzW
-->
<section class="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
	<div class="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
		<div class="flex h-full max-h-screen flex-col gap-4">
			<div class="flex h-[60px] items-center border-b px-6">
				<a class="flex items-center gap-2 font-semibold" href="#">
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
						class="h-6 w-6"
					>
						<path d="m12 14 4-4"></path>
						<path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
					</svg>
					<span class="">Images</span>
				</a>
			</div>
			<div class="flex-1 overflow-auto py-2">
				<nav class="grid items-start px-4 text-sm font-medium">
					<a
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
						href="#"
					>
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
							class="h-4 w-4"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						List 1
					</a>
					<a
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
						href="#"
					>
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
							class="h-4 w-4"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						List 2
					</a>
					<a
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
						href="#"
					>
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
							class="h-4 w-4"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						List 3
					</a>
				</nav>
			</div>
		</div>
	</div>
	<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
		<div class="flex items-center">
			<h1 class="font-semibold text-lg md:text-2xl">List Configuration</h1>
			<button
				class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 ml-auto"
			>
				Save Changes
			</button>
		</div>
		<div class="border shadow-sm rounded-lg">
			<div class="relative w-full overflow-auto">
				<table class="w-full caption-bottom text-sm">
					<thead class="[&amp;_tr]:border-b">
						<tr
							class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<th
								class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0"
							>
								Option
							</th>
							<th
								class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0"
							>
								Value
							</th>
						</tr>
					</thead>
					<tbody class="[&amp;_tr:last-child]:border-0">
						<tr
							class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								Option 1
							</td>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								<input
									class="flex h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-white shadow-none appearance-none pl-2"
									placeholder="Enter value"
									type="text"
								/>
							</td>
						</tr>
						<tr
							class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								Option 2
							</td>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								<input
									class="flex h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-white shadow-none appearance-none pl-2"
									placeholder="Enter value"
									type="text"
								/>
							</td>
						</tr>
						<tr
							class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								Option 3
							</td>
							<td class="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
								<input
									class="flex h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-white shadow-none appearance-none pl-2"
									placeholder="Enter value"
									type="text"
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</main>
</section>
