<script lang="ts">
	import { criteria } from '$lib/data/filter/rating';
	import { getBook } from '$lib/queries';
	import { createQuery } from '@tanstack/svelte-query';
	import { PieChart } from 'echarts/charts';
	import {
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		DataZoomSliderComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import type { ECOption } from '.';
	import { dashboardBookStore } from '../../BookStore.svelte';
	echarts.use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		LegendComponent,
		PieChart,
		CanvasRenderer,
		LabelLayout,
		DataZoomSliderComponent
	]);

	const data = createQuery(() => {
		return {
			queryKey: ['book', 'pie chart', dashboardBookStore.selectedBook?.id],
			queryFn: () => getBook({ id: dashboardBookStore.selectedBook!.id }),
			enabled: !!dashboardBookStore.selectedBook
		};
	});
	const source = $derived(
		data.isSuccess
			? criteria.map((v) => {
					return { name: v.replaceAll('_', ' '), value: data?.data?.[v] };
				})
			: []
	);
	onMount(() => {
		var chartDom = document.getElementById('RatingChart');
		var myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				title: {
					text: 'Book Rating',
					subtext: data.data?.title,
					left: 'center'
				},
				tooltip: {
					trigger: 'item',
					formatter: '{b} <hr/>({d}%)'
				},
				legend: {
					left: 'center',
					top: 5,
					data: criteria,
					show: false
				},
				toolbox: {
					show: true,
					feature: {
						mark: { show: true },
						dataView: { show: true, readOnly: false },
						restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				series: [
					{
						name: 'Area Mode',
						type: 'pie',
						radius: [20, 80],
						center: ['50%', '50%'],
						roseType: 'area',
						itemStyle: {
							borderRadius: 5
						},

						data: source
					}
				]
			};

			option && myChart.setOption(option);
		});
		onDestroy(() => myChart?.dispose());
	});
</script>

<!-- markup (zero or more items) goes here -->
<div id="RatingChart" class="w-50vw h-500px" />

<style>
	/* your styles go here */
</style>
