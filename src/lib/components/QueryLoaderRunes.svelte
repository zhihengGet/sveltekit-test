<script lang="ts" generics="TData,TErr,TVar,TCon">
	import Empty from '$lib/icons/Empty.svelte';
	import EmptyChatIcon from '$lib/icons/chat/EmptyChatIcon.svelte';

	import { OvalSpinner } from '$lib/icons';
	import Spinner from '$lib/icons/loader/Spinner.svelte';
	import { loginError } from '$lib/queries/base/errors';
	import { type Snippet } from 'svelte';
	import type {
		CreateMutationResult,
		CreateQueryResult,
		DefinedCreateQueryResult,
		DefinedQueryObserverResult,
		MutationObserverResult
	} from '@tanstack/svelte-query';
	import { isEmpty } from 'lodash-es';
	/* 	export let CreateQueryResult: CreateQueryResult<TData, TErr> | null = null;
	export let onlyAuth = false;
	export let mutationResult: MutationObserverResult<TData, TErr> | null = null;
	export let showErrorAuth = true; // show error if user is not logged in ? */
	type props = {
		CreateQueryResult?: CreateQueryResult<TData, TErr>;
		mutationResult?: CreateMutationResult<TData, TErr, TVar, TCon>;
		showErrorAuth?: boolean;
		children?: Snippet<[TData]>;
		showEmptyIcon?: boolean;
		DataUI?: Snippet<[TData]>;
		EmptyUI?: Snippet;
		isDataEmpty?: (data: TData) => boolean;
		isLoadingFn?: (data: CreateQueryResult) => boolean;
	};
	let {
		CreateQueryResult,
		mutationResult,
		showErrorAuth = true,
		showEmptyIcon = true,
		DataUI,
		EmptyUI,
		children,
		isLoadingFn = () => false,
		isDataEmpty = isEmpty
	}: props = $props();
	let isAuthErr = $derived(
		CreateQueryResult?.error == loginError ||
			mutationResult?.error == loginError
	);
</script>

{#if CreateQueryResult?.isLoading === true || mutationResult?.isPending === true || isLoadingFn(CreateQueryResult)}
	<OvalSpinner />
{:else if CreateQueryResult?.isError || mutationResult?.isError}
	{#if !isAuthErr || showErrorAuth}
		<p class="text-rose text-base capitalize">
			Error: {CreateQueryResult?.error?.message || 'error occurred'}
		</p>
	{/if}
{:else if CreateQueryResult?.isSuccess && !isDataEmpty(CreateQueryResult?.data)}
	<!-- 	<slot prop={CreateQueryResult!.data} /> -->
	{@render children?.(CreateQueryResult.data)}
{:else if CreateQueryResult?.isSuccess && isDataEmpty(CreateQueryResult?.data) && showEmptyIcon}
	{#if !EmptyUI}
		<Empty />
	{/if}
	{@render EmptyUI?.()}
{/if}
