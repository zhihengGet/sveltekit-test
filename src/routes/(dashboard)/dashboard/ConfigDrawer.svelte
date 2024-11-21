<script lang="ts">
	import Button from '$components/button.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Switch from '$components/ui/switch/switch.svelte';
	import { useGetBookConfig } from '$lib/queries';
	import { useUpdateBookConfig } from '$lib/queries/book/mutate/updateConfig';
	import type { book } from '$lib/types';
	import type { book_setting } from '../../(api)/rest/bookApp.server';
	import { debounce } from 'lodash-es';
	import isEqual from 'lodash-es/isEqual';
	import Input from '$components/ui/input/input.svelte';
	import { isAfter, isBefore } from 'date-fns';
	import { COMMENT_EMAIL_THROTTLER } from '$lib/data/constants';
	import { OvalSpinner } from '$lib/icons';
	let { book, open = $bindable(false) }: { book: book | null; open: boolean } =
		$props();

	let settings = useGetBookConfig(() => {
		return { book_id: book?.id };
	});
	const up = useUpdateBookConfig();

	let data: book_setting = $state({});

	$effect(() => {
		if (settings.data) data = $state.snapshot(settings.data);
	});

	const deb = debounce(() => {
		up.mutate({ book_id: book?.id, ...data });
	}, 600);

	$effect(() => {
		if (
			settings.isSuccess &&
			!isEqual($state.snapshot(data), $state.snapshot(settings.data))
		) {
			deb();
		}
	});
</script>

<Drawer
	title={book?.title ?? 'Loading...'}
	bind:open
	description="Configure how user interact with you & your book"
>
	{#snippet children()}
		<div class="grid gap-4 py-4">
			<div class="text-sm text-gray">
				Do you want to allow user to copy chapter content ?
			</div>
			{#if settings.isLoading}
				<OvalSpinner />
			{/if}
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="copy-paste" class="text-left">Allow Copy/Paste</Label>
				<Switch
					id="copy-paste"
					bind:checked={data.allow_copy}
					disabled={settings.isLoading}
				/>
			</div>
			<div class="text-sm text-gray">A tiny perk for early readers!</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="hidden-book" class="text-left">
					Allow Hidden Book to be Read By Shelved Users
				</Label>
				<Switch
					id="hidden-book"
					disabled={settings.isLoading}
					bind:checked={data.allow_chapter_read_on_hide}
				/>
			</div>
			<div class="text-sm text-gray">
				Select a date on which we will stop emailing you about new
				reviews/comments. Email is rated limited to once per {COMMENT_EMAIL_THROTTLER}
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="knock-review" class="text-left">
					Notify On New Review
					<span class="text-blue">
						[{!isAfter(new Date(), data.notifyOnReview) && data.notifyOnReview
							? 'Valid'
							: 'Expired'}]
					</span>
				</Label>
				<Input
					type="date"
					bind:value={data.notifyOnReview}
					disabled={settings.isLoading}
				/>
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="notf-comm" class="text-left">
					Email On Top Level User Comment <span class="text-blue">
						{isAfter(new Date(), data.notifyOnFirstComment)
							? 'Expired'
							: 'IN Effect'}
					</span>
				</Label>
				<Input type="date" bind:value={data.notifyOnFirstComment} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="notf-comm" class="text-left">Notify On User Replies</Label>
				<Input type="date" bind:value={data.notifyOnUserCommentReply} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4">
				<Label for="book-else" class="text-left">
					Will You Discontinue And Publish Elsewhere(i.e kdp) ?
				</Label>
				<Switch id="book-else" bind:checked={data.discontinue} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">
					If you do stop, will you be willing to give free copies to early
					reviewers?
				</Label>
				<Switch id="arc-book" bind:checked={data.freeARCCopy} />
			</div>
			<hr />
			<div class=" text-black">Set up social links</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">Twitter</Label>
				<Input id="arc-book" bind:value={data.twitter} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">Patreon</Label>
				<Input id="arc-book" bind:value={data.patreon} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">Discord</Label>
				<Input id="arc-book" bind:value={data.discord} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">Facebook</Label>
				<Input id="arc-book" bind:value={data.facebook} />
			</div>
			<div class="grid items-center grid-cols-[1fr_auto] gap-4 pl-2">
				<Label for="arc-book" class="text-left">Reddit</Label>
				<Input id="arc-book" bind:value={data.reddit} />
			</div>
		</div>{/snippet}
</Drawer>
