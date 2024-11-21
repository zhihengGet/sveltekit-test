<script>
	import Drawer from '$components/Drawer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	
var maxDailyReviews = $state(20);
	let open = $state(false);
</script>

<Drawer bind:open description="Update Site Setting" title="Site Configuration">
	<div
		class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200"
	>
		<div
			class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6"
		>
			<form class="space-y-4">
				<div class="flex items-center justify-between">
					<Label
						for="accept-invitation"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Accept Beta Review Invitation
					</Label>
					<Switch id="accept-invitation" />
				</div>

				<div class="space-y-2">
					<Label
						for="max-daily-reviews"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Max Daily Review Invitations (0-100)
					</Label>
					<div class="flex items-center space-x-2">
						<Input
							id="max-daily-reviews"
							type="number"
							min="0"
							max="100"
							value={maxDailyReviews}
							onchange={(e) => (maxDailyReviews = Number(e.target.value))}
							class="flex-grow"
						/>
						<span
							class="text-lg font-semibold text-gray-700 dark:text-gray-300"
						>
							{maxDailyReviews}
						</span>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<Label
						for="hide-high-ratio-books"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Hide Books With High Like/Dislike Ratio
					</Label>
					<Switch id="hide-high-ratio-books" />
				</div>

				<div class="flex items-center justify-between">
					<Label
						for="hide-high-ratio-comments"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Hide Comments With High Like/Dislike Ratio
					</Label>
					<Switch id="hide-high-ratio-comments" />
				</div>

				<div class="space-y-2">
					<Label
						for="custom-css"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Customize Page CSS
					</Label>
					<Textarea
						id="custom-css"
						placeholder="Enter your custom CSS here..."
						class="min-h-[100px] w-full"
					/>
				</div>

				<div class="space-y-2">
					<Label
						for="custom-theme"
						class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Custom Reader Theme Setting
					</Label>
					<Textarea
						id="custom-theme"
						placeholder="Enter your custom theme settings here..."
						class="min-h-[100px] w-full"
					/>
				</div>

				<Button
					type="submit"
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors duration-200"
				>
					Save Settings
				</Button>
			</form>
		</div>
	</div>
</Drawer>

<button></button>
