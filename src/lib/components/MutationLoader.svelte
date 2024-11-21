<script lang="ts">
	import Empty from '$lib/icons/Empty.svelte';
	import Spinner from '$lib/icons/spinner.svelte';
	import type { PostgrestError } from '@supabase/supabase-js';
	import type {
		CreateMutationResult,
		CreateQueryResult
	} from '@tanstack/svelte-query';
	import type { ComponentType } from 'svelte';

	export let CreateQueryResult: CreateMutationResult<any, any>;
</script>

{#if $CreateQueryResult.isLoading}
	<Spinner />
{:else if $CreateQueryResult.isError}
	<p class="text-rose text-base">
		Error: {$CreateQueryResult.error?.message || 'error occurred'}
	</p>
{:else if $CreateQueryResult.isSuccess && $CreateQueryResult.data.length == 0}
	<slot name="spinner"><Empty /></slot>
{:else if $CreateQueryResult.isSuccess}
	<slot />
{/if}
