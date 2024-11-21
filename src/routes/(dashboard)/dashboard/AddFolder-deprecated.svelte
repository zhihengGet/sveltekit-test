<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Dialog from '$lib/components/dialog.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		useGetShelfFolders,
		useUpdateShelfFolder
	} from '$lib/queries/folders/folders';
	import QueryLoaderRunes from '$components/QueryLoaderRunes.svelte';

	let new_bucket = $state('');
	let curr = $state<string[]>([]);
	const buckets = useGetAuthorFolders();
	const up = useUpdateAuthorFolder();
	$effect(() => {
		if (buckets.data) {
			curr = buckets.data.folders ?? [];
		}
	});
	function add() {
		if (new_bucket.trim().length > 0) {
			let uniq = Array.from(new Set(curr.concat([new_bucket])));
			console.log('adding', uniq);
			up.mutate(uniq, {
				onSuccess: () => {
					curr.push(new_bucket);
				}
			});
		}
	}
	function del(bucket: string) {
		if (bucket.trim().length > 0) {
			console.log('adding');
			let n = curr.filter((v) => v != bucket);
			up.mutate(n, {
				onSuccess: () => {
					curr = n;
				}
			});
		}
	}
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import {
		useGetAuthorFolders,
		useUpdateAuthorFolder
	} from '$lib/queries/folders/authorFolder';
	import { dashboardBookStore } from './BookStore.svelte';
</script>

<Dialog
	bind:open={dashboardBookStore.openAddFolderDialog}
	class="w-90% md:w-300px"
>
	<div slot="content" class="flex flex-col gap-2">
		<div>Count: {buckets.data?.folders?.length ?? 0}/200</div>
		<QueryLoaderRunes CreateQueryResult={buckets}>
			<div class="flex">
				{#each curr as item}
					<AlertDialog.Root>
						<AlertDialog.Trigger asChild let:builder>
							<Button builders={[builder]} variant="ghost">
								{item}
							</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Content class="z-52">
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

		<Input placeholder="Add A New Bucket" bind:value={new_bucket} />
		<Button disabled={buckets.isLoading || up.isPending} onclick={add}>
			Add Bucket {up.status}
			{new_bucket}
		</Button>
	</div>
</Dialog>
