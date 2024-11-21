<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import Button from '$components/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import { user } from '$lib/state/runes.svelte';
	import { camelCase, snakeCase } from 'lodash-es';
	import {
		Email,
		Reddit,
		LinkedIn,
		Pinterest,
		Telegram,
		Tumblr,
		Vk,
		WhatsApp,
		Xing,
		Facebook,
		X,
		Line
	} from 'svelte-share-buttons-component';
	import {
		HackerNewsLink,
		FacebookLink,
		TwitterLink,
		RedditLink
	} from 'svelte-social-links';
	let {
		url,
		title,
		description,
		open = $bindable(false),
		book_title
	}: {
		title: string;
		description: string;
		open?: boolean;
		url: string;
		book_title: string;
	} = $props();

	let newData = $state({
		title: title,
		description: description,
		url: url,
		hashTags: [title, book_title, 'novel', 'forkread', user.username]
	});
	let tags = $derived(newData.hashTags.map((v) => snakeCase(v)));
</script>

<Drawer
	bind:open
	title="Share Your work!"
	description="Be cool and do not spam..."
>
	{#snippet children()}
		<form class="">
			<label for="s-title">Title</label>
			<Input id="s-title" bind:value={newData.title} />
			<label for="share-description">Description</label>
			<Input id="s-description" bind:value={newData.description} />
			<label for="share-url">URL</label>
			<Input id="share-url" bind:value={newData.url} />
			<!-- <label for="share-url" class="capitalize">Via {tags.length}</label>
			<Input
				id="share-url"
				bind:value={newData.hashTags}
				placeholder="novel,fork,love"
			/> -->
			<label for="share-url" class="capitalize">hashtags {tags.length}</label>
			<Input
				id="share-url"
				bind:value={newData.hashTags}
				placeholder="novel,fork,love"
			/>
		</form>
		{book_title.replaceAll(' ', '').replaceAll(',', '')}
		<div class="flex flex-wrap gap-2">
			<FacebookLink url={newData.url} hashtag={newData.title} />
			<TwitterLink
				title={newData.title}
				url={newData.url}
				hashtags={tags}
				via=""
				related=""
				inReplyTo={undefined}
			/>
			<HackerNewsLink {title} {url} />
			<!-- 	<Email subject={title} body="{description} {url}" class="w-10 h-10" /> -->

			<RedditLink {title} {url} class="w-10 h-10" />
			<!-- 	<LinkedIn class="share-button" {url} /> -->
			<!-- 	<Tumblr class="share-button" {title} {url} caption={title} /> -->
			<Pinterest
				{url}
				media="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/200px-Svelte_Logo.svg.png"
				description={title}
				class="w-10 h-10"
			/>
			<Telegram text={title} {url} class="w-10 h-10" />
			<Vk {title} {url} class="w-10 h-10" />
			<WhatsApp text="{title} {url}" class="w-10 h-10" />
			<Xing {title} {url} class="w-10 h-10" />
			<!-- 	<Facebook class="share-button" quote={title} {url} /> -->
			<Line {url} class="w-10 h-10" />
		</div>
	{/snippet}
</Drawer>

<button
	class="text-sm hover:blue standout"
	onclick={() => {
		open = !open;
	}}
>
	Share
</button>
