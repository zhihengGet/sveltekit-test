<script lang="ts">
	import { criteria } from '$lib/data/filter/rating';
	import { CustomError } from '$lib/queries/base/errors';
	import { createQuery } from '@tanstack/svelte-query';
	import { PieChart } from 'echarts/charts';
	import {
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import type { ECOption } from '.';
	import { dashboardBookStore } from '../../BookStore.svelte';
	import { client } from '$lib/queries/api';
	echarts.use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		LegendComponent,
		PieChart,
		CanvasRenderer,
		LabelLayout
	]);

	const data = createQuery(() => ({
		queryKey: ['age distribution', dashboardBookStore.selectedBook?.title],
		queryFn: async () => {
			const data = await client.rest.api.books.protected.stats['age_dist'].$get(
				{
					query: { book_id: dashboardBookStore.selectedBook!.id + '' }
				}
			);

			if (data.status != 200)
				throw new CustomError('Failed to fetch age group');
			return await data.json();
		},
		enabled: !!dashboardBookStore.selectedBook
	}));
	const source = $derived(data.isSuccess && data ? data.data : []);

	const sample: any[] = [];

	for (let index = 0; index < 5; index++) {
		sample.push([index, index * Math.random() * 10]);
	}
	onMount(() => {
		var chartDom = document.getElementById('age-group-d');
		var myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				tooltip: {
					trigger: 'item',
					formatter: '{a} : {c} '
				},
				title: { text: 'Age Group Distribution', subtext: '', left: 'center' },
				legend: {
					left: 'center',
					top: 'bottom',
					data: criteria,
					show: false
				},
				dataZoom: [
					{
						type: 'slider'
					}
				],
				toolbox: {
					show: true,
					feature: {
						mark: { show: true },
						dataView: { show: true, readOnly: false },
						restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				dataset: {
					// 提供一份数据。
					source: [['age group', 'number'], ...source]
				},
				xAxis: { type: 'category' },
				yAxis: {
					type: 'value'
				},
				series: { type: 'bar' }
			};
			console.log(option);
			option && myChart.setOption(option);
		});
		onDestroy(() => myChart?.dispose());
	});
</script>

<!-- markup (zero or more items) goes here -->
<div id="age-group-d" class="w-50vw h-500px"></div>

<style>
	/* your styles go here */
</style>
