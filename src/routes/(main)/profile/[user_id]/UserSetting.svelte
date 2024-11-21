<script lang="ts">
	import { useUpdateUserSettings } from '$lib/queries/user/mutate/userSetting';
	import { useGetUserMainSetting } from '$lib/queries/user/getUser';
	import { type user_global_configs } from '$lib/types';
	import debounce from 'lodash-es/debounce';
	import { untrack } from 'svelte';
	import Drawer from '$components/Drawer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';

	let open = $state(false);
	const update = useUpdateUserSettings();
	const set = useGetUserMainSetting();
	const deb = debounce(() => {
		update.mutate(value);
		Object.assign(original_config, $state.snapshot(value));
	}, 1000);
	let value: user_global_configs = $state({});
	let saved = $state({ is_init: false });
	let original_config = {};

	$effect(() => {
		console.log(saved);
		if (JSON.stringify(value) && saved.is_init) deb();
		if (set.isSuccess && !saved.is_init) {
			untrack(() => {
				let temp = $state.snapshot(set.data);
				Object.assign(original_config, temp);
				Object.assign(value, temp);
				saved.is_init = true;
				console.log('updated', saved);
			});
		}
	});
</script>

<!-- <div class="p-2">
	<h3 class="text-xl font-600">User Setting</h3>
	<div
		class="grid grid-cols-1 md:grid-cols-2 mt-2 gap-2 mb-2 border-3 border-dashed p-2"
	>
		<span class="flex items-center gap-2">
			<label for="accept" class="font-medium text-sm w-3/4">
				Accept beta review invitation
			</label>
			<input
				id="accept"
				type="checkbox"
				class="w-1em h-1em"
				bind:checked={value.is_beta_reader}
			/>
		</span>
		<span class="flex items-center gap-2">
			<label for="Max Review Invitation" class=" text-sm font-medium w-3/4">
				Max Daily Review Invitation(0-100)
			</label>
			<input
				id="Max Review Invitation"
				type="number"
				class="w-20 border-1 px-1 border-gray"
				max="50"
				bind:value={value.max_author_invitation_per_day}
			/>
		</span>
		<span class="flex items-center gap-2">
			<label
				for="hide_book"
				class="font-medium text-sm text-gray w-3/4 shrink-0 grow-0"
			>
				Hide Book With High Like/Dislike Ratio
			</label>
			<input
				id="hide_book"
				type="checkbox"
				class="w-1em h-1em"
				disabled={true}
			/>
		</span>
		<span class="flex items-center gap-2">
			<label for="hide_comment" class=" text-sm font-medium text-gray w-3/4">
				Hide Comment With High Like/Dislike Ratio
			</label>
			<input
				id="hide_comment"
				type="checkbox"
				class="w-20 border-1 px-1 border-gray hidden"
				max="50"
				disabled={true}
			/>
		</span>
		<span class="flex items-center gap-2">
			<label for="accept" class="font-medium text-sm text-gray w-3/4">
				Customize Page CSS
			</label>
			<input id="accept" type="checkbox" class="w-1em h-1em" disabled={true} />
		</span>
		<span class="flex items-center gap-2 text-gray">
			<label for="Max Review Invitation" class=" text-sm font-medium w-3/4">
				Custom Reader Theme Setting
			</label>
			<input
				id="Max Review Invitation"
				type="number"
				class="w-20 border-1 px-1 border-gray"
				max="50"
				disabled={true}
			/>
		</span>
	</div>
</div> -->

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
			<Switch id="accept-invitation" bind:checked={value.is_beta_reader} />
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
					class="flex-grow"
					bind:value={value.max_author_invitation_per_day}
				/>
			</div>
		</div>

		<div class="flex items-center justify-between opacity-20">
			<Label
				for="hide-high-ratio-books"
				class="text-sm font-medium text-gray-700 dark:text-gray-300"
			>
				Hide Books With High Like/Dislike Ratio
			</Label>
			<Switch id="hide-high-ratio-books" disabled />
		</div>

		<div class="flex items-center justify-between opacity-20">
			<Label
				for="hide-high-ratio-comments"
				class="text-sm font-medium text-gray-700 dark:text-gray-300"
			>
				Hide Comments With High Like/Dislike Ratio
			</Label>
			<Switch id="hide-high-ratio-comments" disabled />
		</div>

		<div class="space-y-2 opacity-20">
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
				disabled
			/>
		</div>

		<div class="space-y-2 opacity-20">
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
				disabled
			/>
		</div>
		<!-- 
		<Button
			type="submit"
			class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors duration-200"
		>
			Save Settings
		</Button> -->
	</form>
</div>
