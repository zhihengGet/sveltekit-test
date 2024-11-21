<script lang="ts">
	import Select from '$components/Select.svelte';
	import { Button, FileUpload } from '$lib/components';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		categoryOptions,
		langOptions,
		leadOptions,
		statusOption,
		TagsOptionGroup,
		ContenTMatureTags,
		BAD_CONTENT
	} from '$lib/data/filter';
	import { useCheckTitle, useCreateBook, useUpdateBook } from '$lib/queries';
	import { bookSchema } from '$lib/schema';

	import Spinner from '$lib/icons/spinner.svelte';
	import useUpload, {
		getPublicBookCoverUrl
	} from '$lib/queries/storage/useUpload';
	import type { book } from '$lib/types';
	import { debounce, isEmpty } from 'lodash-es';
	import { flushSync, untrack } from 'svelte';
	import { dashboardBookStore } from './BookStore.svelte';
	import { enhance } from '$app/forms';
	let { open = $bindable(false) }: { open: boolean } = $props();
	const create = useCreateBook();
	const update = useUpdateBook();

	let isNew = $derived(dashboardBookStore.selectedBook ? false : true);
	let title = $derived(
		dashboardBookStore.selectedBook
			? dashboardBookStore.selectedBook.title
			: 'Create'
	);
	let old_url = dashboardBookStore.selectedBook?.cover_url ?? '';
	let action = $derived(dashboardBookStore.selectedBook ? 'Save' : 'Create');

	let status = $state('');
	let files: File[] = $state([]);
	let form: book = $state(
		$state.snapshot(dashboardBookStore.selectedBook) ?? {
			language: DEFAULT_BOOK_LANGUAGE
		}
	);
	let last_category = '';
	$effect(() => {
		untrack(() => {
			last_category = form.category;
		});
		form = $state.snapshot(dashboardBookStore.selectedBook) ?? {};
	});
	const upload = useUpload('bookCover');
	//TODO we can make cover_url an generated column as it will not change
	// 3 api required for create : create -> upload cover -> update
	const submit = async ({ cancel }) => {
		const { success, error, data } = await bookSchema.safeParseAsync(form);
		if (!success) {
			console.log('validation failed', error.errors);
			return;
		}
		console.log(
			'form data',
			$state.snapshot(dashboardBookStore.selectedBook),
			$state.snapshot(form),
			data
		);
		console.log('form data1', form, data);

		form.title = form.title.trim();
		form = { ...form, ...data };
		form.tags = [...form.tags, ...customTags];
		//let should_update = isNew === false;
		if (isNew) {
			const book = await create.mutateAsync({
				...form
			});
			// create book first
			dashboardBookStore.selectedBook = book; // so that we  can update book
			//should_update = false;
		}
		let url =
			!isNew || !dashboardBookStore.selectedBook?.id
				? { cover_url: dashboardBookStore.selectedBook?.cover_url }
				: {
						cover_url: await getPublicBookCoverUrl(
							dashboardBookStore.selectedBook.id
						)
					};
		if (files.length == 1 && files[0]) {
			url.cover_url = await upload.mutateAsync({
				file: files[0],
				bookid: dashboardBookStore.selectedBook?.id
			});
			old_url = url.cover_url; // uploaded
		}
		// update book or its cover_url
		console.log('form', form);
		const r = await update.mutateAsync({
			old: $state.snapshot(dashboardBookStore.selectedBook),
			new_book: { ...$state.snapshot(form), cover_url: url.cover_url } // don't need to update cover_url as it is immutable
		});
		console.log('form submitted', r);
		if (r) {
			dashboardBookStore.selectedBook = Object.assign(
				dashboardBookStore.selectedBook,
				form
			);
		}
		cancel();
	};

	let newTitle = $derived({ title: form.title });
	const title_checker = useCheckTitle(() => newTitle);

	let max_age = $state();
	let min_age = $state();
	$effect(() => {
		if (form.age_range && typeof form.age_range == 'object') {
			untrack(() => {
				const [a, b] = form.age_range;
				if (a && b) {
					min_age = a;
					max_age = b;
				}
			});
		}
	});
	$effect(() => {
		let rune = form;
		if (rune.category !== last_category && rune.category && last_category) {
			console.log('category changed', rune.category, last_category);
			last_category = rune.category;
			flushSync(() => {
				form.tags = [];
			});
		}
	});
	/* $effect(() => {
		console.log(min_age, max_age);
		if (min_age > max_age) {
			max_age = min_age;
		}
	}); */
	let errors: { [s in keyof book]?: string } = $state({});
	const deb = debounce(format, 200);
	function format() {
		const data = bookSchema.safeParse(form).error?.format();
		console.log('ff', data);

		const l = Object.keys(data ?? {});
		for (let x of l) {
			data[x] = data[x]._errors?.[0];
		}
		errors = data;
	}
	$effect(() => {
		if ({ ...form }) deb();
	});
	let isTitleBad = $derived(
		isNew
			? title_checker.data === false
			: title_checker.data === false && form.title !== title
	);
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import {
		BOOK_LIMITATIONS,
		DEFAULT_BOOK_LANGUAGE,
		MAX_BOOK_CUSTOM_TAG,
		MAX_BOOK_PRESET_TAG
	} from '$lib/data/constants';
	import { primaryAudienceOptions } from '$lib/data/filter/age';

	let customTags = $state([]);
</script>

{#snippet list()}
	<ol class="ml-5 list-decimal">
		{#each BAD_CONTENT as item}
			<li class="break-words">
				<span class="underline">{item.label}:</span>
				{item.description}
			</li>
		{/each}
	</ol>
{/snippet}
<Dialog.Root
	bind:open={dashboardBookStore.openCreateBook}
	closeOnOutsideClick={false}
	onOpenChange={() => {
		if (dashboardBookStore.selectedBook)
			dashboardBookStore.selectedBook.cover_url = old_url ?? '';

		dashboardBookStore.selectedBook = null;
	}}
>
	<!-- 	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		Create Books
	</Dialog.Trigger> -->

	<Dialog.Content class="md:max-w-[600px] max-h-8/10 overflow-auto">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				You will be able to change these later on...
			</Dialog.Description>
		</Dialog.Header>
		<Accordion.Root class="w-8/10" type="single">
			<Accordion.Item value="item-1">
				<Accordion.Trigger class="text-yellow-800 font-bold">
					Make sure your book is appropriate!
				</Accordion.Trigger>
				<Accordion.Content>
					{@render list()}
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
		<!-- 		<ul class="list-alpha ml-5">
			{#each BAD_CONTENT.banned_content as item}
				<li class="text-sm">{item.label}</li>
			{/each}
		</ul> -->
		<form
			method="POST"
			class="grid gap-4 py-4"
			autocomplete="off"
			use:enhance={submit}
		>
			<!-- {JSON.stringify(form)} -->
			<!-- <span class="text-sm text-gray">Make sure title is appropriate !</span> -->
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Title</Label>
				<Input
					name="title"
					autocomplete="off"
					class="col-span-3"
					bind:value={form.title}
					aria-invalid={null}
				/>
			</div>
			{#if title_checker.isLoading}
				<Spinner class="mx-auto" />
			{/if}
			{#if errors?.title}
				<span class="mx-auto text-red">
					{errors?.title}
				</span>
			{/if}
			{#if isTitleBad}
				<p class="mx-auto text-neutral">
					Oops! Looks like someone else is already using a similar book title
				</p>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Category</Label>
				<Select
					class="col-span-3 "
					items={categoryOptions}
					bind:value={form.category}
					disableSearch={true}
				/>
			</div>

			{#if errors?.category}
				<span class="mx-auto text-red">{errors?.category}</span>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Tags</Label>
				<Select
					size={MAX_BOOK_PRESET_TAG}
					items={TagsOptionGroup[form.category] ?? []}
					class="col-span-3"
					bind:value={form.tags}
					maxCustomItemSize={MAX_BOOK_CUSTOM_TAG}
					allowCustomOptionItems={false}
					bind:customItems={customTags}
					disabled={!form.category}
				/>
			</div>

			{#if errors?.tags?._errors?.length}
				<span class="mx-auto text-red">
					{errors?.tags._errors?.join('/')}
				</span>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4 hidden">
				<Label class="text-right">Price🚧</Label>
				<div class="col-span-3">
					<p class="text-[12px] text-gray">
						If you set price > 0 here , then you cannot set price on a per
						chapter basis
					</p>
					<Input
						id="price"
						disabled={true}
						type="number"
						min={0}
						max={999999999999}
						class="col-span-3"
						bind:value={form.price}
					/>
				</div>
				{#if errors?.price}
					<span class="mx-auto text-red hidden">
						{errors?.price}
					</span>
				{/if}
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Leads</Label>
				<Select
					items={leadOptions}
					bind:value={form.lead}
					class="col-span-3"
					disableSearch={true}
				/>
			</div>
			{#if errors?.lead}
				<span class="mx-auto text-red">
					{errors?.lead}
				</span>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Language</Label>
				<Select
					items={langOptions}
					disabled={false}
					bind:value={form.language}
					class="col-span-3"
				/>
			</div>
			{#if errors?.language}
				<span class="mx-auto text-red">
					{errors?.language}
				</span>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Status</Label>
				<Select
					items={statusOption}
					class="col-span-3"
					bind:value={form.status}
					disableSearch={true}
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Content Rating</Label>
				<Select
					class="col-span-2"
					items={ContenTMatureTags}
					bind:value={form.maturity_levels}
					disabled={false}
					size={4}
					disableSearch={true}
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Primary Audience</Label>
				<Select
					class="col-span-2"
					items={primaryAudienceOptions}
					bind:value={form.audience}
					disabled={false}
					disableSearch={true}
				/>
			</div>
			<!-- <div class="grid grid-cols-4 items-center gap-2">
				<Label class="text-right">Or</Label>
				<Select
					items={ageList}
					class="col-span-1"
					bind:value={min_age}
					disabled={false}
					disableSearch={true}
					size={1}
				/>
				<Select
					items={ageList.filter((v) => v.value >= min_age)}
					class="col-span-2"
					bind:value={max_age}
					disabled={min_age == undefined}
					disableSearch={true}
				/>
			</div>
			{#if min_age > max_age}
				<span class="mx-auto text-red">Invalid Age Combination</span>
			{/if} -->
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Authors Words</Label>
				<Input id="price" bind:value={form.authors_words} class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right" for="display_name">
					Author Name (Optional)
				</Label>
				<Input
					id="display_name"
					bind:value={form.display_name}
					placeholder="Don't want to use your username?"
					class="col-span-3"
				/>
			</div>
			{#if errors?.authors_words}
				<span class="mx-auto text-red">
					{errors?.authors_words}
				</span>
			{/if}
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Summary</Label>
				<Input id="price" bind:value={form.summary} class="col-span-3" />
			</div>
			{#if errors?.summary}
				<span class="mx-auto text-red">
					{errors?.summary}
				</span>
			{/if}
			<!-- <SuperDebug data={form} /> -->

			<div>
				<FileUpload
					uploadUI={false}
					displayPreview={true}
					bind:fileArray={files}
					initURL={dashboardBookStore.selectedBook?.cover_url}
					onPreviewURLChange={(v) => {
						if (dashboardBookStore.selectedBook && v)
							dashboardBookStore.selectedBook.cover_url = v;
					}}
				>
					{#snippet PreviewImage(src)}
						<img
							class="book_sizing_md object-contain"
							alt={'Invalid Image'}
							{src}
						/>
					{/snippet}
				</FileUpload>
				<span class="text-sm">
					⚠ It might take
					<b class="text-amber-600">4 hours</b>
					for new image to appear. Please do not resubmit !
				</span>
			</div>
			<Dialog.Footer>
				{#if create.error || update.error}
					<span>{create.error?.message || update.error?.message}</span>
				{/if}
				<!-- {JSON.stringify(errors)} -->
				<Button
					type="submit"
					isLoading={create.isPending || update.isPending}
					disabled={!isEmpty(errors)}
				>
					{action}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
