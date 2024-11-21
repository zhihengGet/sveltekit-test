<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import FileUpload from '$components/FileUpload.svelte';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';
	import SearchDropdown from '$components/SearchDropdown.svelte';
	import Select from '$components/Select.svelte';
	import Button from '$components/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import { SITE_URL } from '$lib/data/constants';
	import { langOptions } from '$lib/data/filter';
	import { industries } from '$lib/data/industry';
	import { user_tag_select_items } from '$lib/data/tags';
	import QuillEditor from '$lib/editor/QuillEditor.svelte';
	import { useUpdateAuthCredential, useUpdateUserInfo } from '$lib/queries';
	import useUpload from '$lib/queries/storage/useUpload.js';
	import { user } from '$lib/state/runes.svelte';
	import { supabase } from '$lib/supabaseClient/client';
	import type { profile } from '$lib/types';
	import { timeAgo } from '$lib/utils/timeAgo.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { tick } from 'svelte';
	import { string } from 'zod';
	let {
		profile,
		email,
		open = $bindable(false)
	}: { profile: profile; email: string } = $props();
	let files: File[] = $state([]);
	let updateEmailRet = $state('');
	let modified: profile & { email: string } = $state(
		profile
			? {
					...profile,
					email: email,
					birthday: profile.birthday
						? new Date(profile.birthday).toISOString().split('T')[0]
						: ''
				}
			: {
					username: '',
					language: 'English',
					email: email,
					birthday: '',
					occupation: ''
				}
	);
	const isSelf = $derived(user?.id === profile?.id);
	const oldProfile = $state.snapshot(profile);
	const upload = useUpload('avatar');
	const updateFn = useUpdateUserInfo();
	async function save() {
		await tick();
		if (oldProfile) {
			updateFn.mutate({
				new_user: {
					...modified,
					email: undefined
					//about_you: html
				},
				old: oldProfile
			});
		}
	}

	$inspect(modified);

	const updateEmail = useUpdateAuthCredential();

	const cache: Record<string, boolean> = {};
	const checkUsername = createQuery(() => ({
		queryKey: ['check username', modified],
		queryFn: async () => {
			if (modified.username === profile?.username) {
				return false;
			}
			if (modified.username in cache) return cache[modified.username];
			const exists = await supabase
				.from('profiles')
				.select('id')
				.eq('username', modified.username);
			if (exists.error) return false;
			cache[modified.username] = exists.data?.length > 0;

			return exists.data?.length > 0;
		}
	}));
</script>

<Drawer
	bind:open
	openFocus={false}
	description="Email & Avatar are updated separately. Industry and age data will be used by authors to view anonymous user demographics for their books"
	title={'Profile'}
	class="w-screen md:w-[550px] h-fit max-h-90vh p-3"
>
	{#snippet children()}
		<div class="flex items-center gap-2">
			<div class="text-sm text-green">{updateEmailRet}</div>
			<label for="Email" class="inline-block w-1/4">Email</label>
			<Input
				class="w-2/3 inline-flex"
				bind:value={modified.email}
				type="email"
				required={true}
			/>
			<Button
				isLoading={updateEmail.isPending}
				variant="outline"
				size="sm"
				disabled={email === modified.email ||
					string().email().safeParse(modified.email).success === false}
				onclick={() => {
					updateEmailRet = '';
					updateEmail.mutate(
						{ email: modified.email, redirectTo: SITE_URL + 'auth/text' },
						{
							onSuccess: () => {
								updateEmailRet =
									'Please confirm this change by checking  both OLD and NEW email inbox';
							}
						}
					);
				}}
			>
				Update Email
			</Button>
		</div>
		<hr class="mt-2 w-4/6 mx-auto bg-amber-400" />
		<div class="overflow-y-auto max-h-1/2 md:max-h-50vh">
			<div class="flex flex-col gap-3 pt-1 p-4">
				<div class="flex justify-between items-center">
					<label for="birthday" class="inline-block w-1/4">Tags(3)</label>
					<Select
						items={user_tag_select_items}
						size={3}
						bind:value={modified.tags}
					/>
				</div>
				<div class="flex justify-between items-center">
					<label for="birthday" class="inline-block w-1/4">Birth Date</label>
					<Input
						class="border-1 w-3/4"
						type="date"
						bind:value={modified.birthday}
					/>
				</div>
				<div class="flex items-center capitalize">
					<span class="inline-block w-1/4">industry</span>
					<SearchDropdown
						dataset={industries.map((v) => {
							return { label: v, value: v };
						})}
						class=" w-3/4"
						bind:value={modified.industry}
						initialText={'Select an industry'}
					/>
				</div>

				<div class="flex justify-between">
					<label for="username" class="inline-block w-1/4 capitalize">
						username
						<div class="text-amber-900 text-xs">
							{checkUsername.data ? '🗙 Username already exists ⛔' : '✅Good'}
						</div>
					</label>
					<Input
						class="w-3/4  rounded justify-end"
						id="username"
						disabled={!isSelf}
						bind:value={modified.username}
					/>
				</div>
				<div class="grid grid-cols-4 items-center capitalize">
					<span class="inline-block w-1/4">language</span>
					<SearchDropdown
						dataset={langOptions}
						class=""
						initialText={'Select an primary language'}
						bind:value={modified.language}
					/>
				</div>
			</div>

			<FileUpload
				displayPreview={true}
				initURL={user.avatar_url}
				uploadUI={false}
				bind:fileArray={files}
			>
				{#snippet PreviewImage(src)}
					<div class="flex justify-center flex-col items-center">
						<img
							{src}
							class="w-20 h-20 rounded-full object-fill"
							alt="Invalid"
						/>
						{#if src}
							<!-- <span class="text-sm text-gray break-words text-center">
								click the <b class="text-yellow">yellow</b>
								upload button to upload
							</span> -->
							<span
								class="text-blue text-sm font-medium leading-relaxed text-center"
							>
								It might take up to
								<b>4 hours</b>
								for your new image to appear due to caching.
							</span>
						{/if}
					</div>
				{/snippet}
			</FileUpload>
			<hr class="my-1" />
			<p class="line-height-loose">
				Update: {timeAgo(new Date(user.updated_at))}
			</p>
			<div class="h-max">
				<QuillEditor
					type="limited"
					debounceInput={false}
					bind:value={modified.about_you}
					placeholder="Write something about you !"
				/>
			</div>
			<QueryLoaderRunes mutationResult={updateFn} />
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="inline-block w-fit">
			<Button
				isLoading={upload.isPending}
				disabled={files.length == 0}
				onclick={() => {
					let e = files[0];
					if (files.length > 0 && e) {
						console.log('on update');
						upload.mutate({ file: e });
					}
				}}
			>
				Save Avatar
			</Button>
			<Button
				onclick={save}
				isLoading={updateFn.isPending}
				disabled={checkUsername.data}
			>
				Save
			</Button>
		</div>
	{/snippet}
</Drawer>
