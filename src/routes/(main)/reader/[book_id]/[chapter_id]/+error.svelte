<script>
	import Error from '../../../Error.svelte';
	import { page } from '$app/stores';
</script>

<Error description="404 Chapter">
	This chapter no longer exists(unpublished or deleted) <p class="text-xs">
		{$page.error?.message}
	</p>
</Error>
