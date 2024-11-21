<script lang="ts">
	import { page } from '$app/stores';
	import LoginButton from '$lib/composite/LoginButton.svelte';
	import { user } from '$lib/state/runes.svelte';
	import { untrack } from 'svelte';
	import { useJoinRoom } from '../../query.js';
	import Label from '$components/ui/label/label.svelte';
	import Input from '$components/ui/input/input.svelte';
	let { data } = $props();

	const pageRunes = $derived($page);

	const join = useJoinRoom();
	let status = $state('Trying');
	let inputData = $state({
		name: user.username,
		description: 'I,Author'
	});
	function handlerJoin() {
		join.mutate(
			{
				room_id: pageRunes.params.room_id,
				secret: pageRunes.url.searchParams.get('secret'),
				name: inputData.name,
				description: inputData.description
			},
			{
				onSuccess: () => {
					status = 'You just joined a room, please be nice!';
				},
				onError: (error) => {
					status = error.message;
				}
			}
		);
	}
	$effect(() => {
		if (user.authStatus != 'signed in') {
			status = 'Please login';
		}
	});
	$effect(() => {
		if (pageRunes.params.room_id && user.authStatus === 'signed in') {
			untrack(() => {
				status = 'Joining';
				join.mutate(
					{
						room_id: pageRunes.params.room_id,
						secret: pageRunes.url.searchParams.get('secret')
					},
					{
						onSuccess: () => {
							status = 'You just joined a room, please be nice!';
						},
						onError: (error) => {
							status = error.message;
						}
					}
				);
			});
		} else if (user.authStatus === 'signed in') {
			status = 'waiting for room info';
		}
	});
	function showAuth() {}
</script>

<div>
	<div class="flex flex-col items-center justify-center">
		{#if user.authStatus !== 'signed in'}
			<LoginButton />
		{/if}
		<div class="w-200px mt-10 p-2">
			<Label>Name</Label>
			<Input
				bind:value={inputData.name}
				placeholder="Your username, max(100)"
			/>
			<Label>Description</Label>
			<Input
				bind:value={inputData.description}
				placeholder="why do you want to join this room? max(200)"
			/>
			<!-- <Button onclick={handlerJoin}>Submit</Button> -->
		</div>
		<p class="font-bold text-lg mt-50px text-red-500 font-500">
			{status}...
		</p>
	</div>
</div>
