<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Dialog from '$lib/components/dialog.svelte';
	import { Input } from '$lib/components/ui/input';
	import {
		useGetShelfFolders,
		useUpdateShelfFolder
	} from '$lib/queries/folders/folders';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';

	let {
		type = 'shelf',
		bindOpen = $bindable(false)
	}: {
		type: 'author' | 'shelf';
		bindOpen: boolean;
	} = $props();

	let new_bucket = $state('');
	let curr = $state<string[]>([]);
	const buckets =
		type == 'shelf' ? useGetShelfFolders() : useGetAuthorFolders();
	const up = type == 'shelf' ? useUpdateShelfFolder() : useUpdateAuthorFolder();
	$effect(() => {
		if (buckets.data) {
			curr = buckets.data.folders ?? [];
		}
	});
	function add() {
		new_bucket = new_bucket.trim();
		if (new_bucket.trim().length > 0) {
			const uniq = Array.from(new Set(curr.concat([new_bucket])));
			console.log('adding', uniq.slice(Math.max(uniq.length - 200, 1)));
			up.mutate(uniq);
		}
	}
	function del(bucket: string) {
		if (bucket.trim().length > 0) {
			console.log('adding');
			let n = curr.filter((v) => v != bucket);
			up.mutate(n, {
				onSuccess: () => {
					//curr = n;
				}
			});
		}
	}
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import {
		useGetAuthorFolders,
		useUpdateAuthorFolder
	} from '$lib/queries/folders/authorFolder';
	import { MAX_FOLDERS_SIZE } from '$lib/data/constants';
</script>

<Dialog bind:open={bindOpen} class="w-[90%] md:w-[300px]">
	<div slot="content" class="flex flex-col flex-wrap gap-2">
		<div>Count: {buckets.data?.folders?.length ?? 0}/{MAX_FOLDERS_SIZE}</div>
		<QueryLoaderRunes CreateQueryResult={buckets}>
			<div class="flex flex-wrap gap-1">
				{#each curr as item}
					<AlertDialog.Root>
						<AlertDialog.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="ghost"
								class="border-1 border-amber"
							>
								{item}
							</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Content class="z-52 ">
							<AlertDialog.Header>
								<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. All book contained will be moved
									to default;
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action onclick={() => del(item)}>
									Continue
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{/each}
			</div>
		</QueryLoaderRunes>

		<Input
			placeholder="Add A New Bucket"
			bind:value={new_bucket}
			autocomplete="off"
		/>
		<Button isLoading={buckets.isLoading || up.isPending} onclick={add}>
			Add Bucket
			{new_bucket}
		</Button>
	</div>
</Dialog>
