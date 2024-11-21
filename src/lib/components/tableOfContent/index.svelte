<script lang="ts">
	import Tree from './tree.svelte';
	import { createTableOfContents } from '@melt-ui/svelte';
	let { selector } = $props<{ selector: string }>();
	const {
		elements: { item },
		states: { activeHeadingIdxs, headingsTree }
	} = createTableOfContents({
		selector: selector,
		exclude: [],
		activeType: 'all',
		//headingFilterFn: (heading) => !heading.hasAttribute('data-toc-ignore'),
		scrollFn: (id) => {
			/**
			 * Here we're overwriting the default scroll function
			 * so that we only scroll within the ToC preview
			 * container, instead of the entire page.
			 */
			const container = document.querySelector(selector);
			const element = document.getElementById(id);

			if (container && element) {
				container.scrollTo({
					top: element.offsetTop - container.offsetTop - 16,
					behavior: 'smooth'
				});
			}
		}
	});

	let hideHeading = false;
</script>

<!-- {JSON.stringify($headingsTree)} -->
<div class="grid h-[18rem] w-full gap-2">
	<div class="overflow-y-auto rounded-lg p-4 bg-magnum-100">
		<p class="font-semibold text-neutral-900">
			On This Page <button class="float-right">X</button>
		</p>
		<nav>
			{#key $headingsTree}
				<Tree
					tree={$headingsTree}
					activeHeadingIdxs={$activeHeadingIdxs}
					{item}
				/>
			{/key}
		</nav>
	</div>
</div>
<!-- 
<style lang="postcss">
	#toc-builder-preview > h2 {
		@apply text-xl font-bold;
	}

	#toc-builder-preview > h3 {
		@apply text-lg font-bold;
	}

	#toc-builder-preview > h4 {
		@apply text-lg font-semibold;
	}

	.hide-heading {
		display: inline-flex;
		height: theme(spacing.8);
		cursor: default;
		align-items: center;
		justify-content: center;
		border-radius: theme(borderRadius.md);
		background-color: theme(colors.magnum.200);
		padding-inline: theme(spacing.4);
		line-height: 1;
		font-weight: theme(fontWeight.semibold);
		color: theme(colors.magnum.900);
		@apply transition;

		&:hover {
			opacity: 0.75;
		}
	}
</style>
 -->
