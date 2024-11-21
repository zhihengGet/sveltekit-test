<script lang="ts" generics="T">
	let {
		error,
		key,
		class: classes = 'text-red'
	} = $props<{
		error: any;
		key: string;
		class?: string;
	}>();
</script>

{#if $error[key]}
	<div class={classes}>
		{$error[key]}
	</div>
{/if}
