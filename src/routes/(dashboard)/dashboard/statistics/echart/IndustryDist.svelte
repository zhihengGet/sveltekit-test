<script lang="ts">
	import { criteria } from '$lib/data/filter/rating';
	import { supabaseClient } from '$lib/supabaseClient/client';
	import { createQuery } from '@tanstack/svelte-query';
	import { PieChart, BarChart } from 'echarts/charts';
	import {
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		GridComponent,
		DataZoomInsideComponent,
		DatasetComponent,
		DataZoomSliderComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import type { ECOption } from '.';
	import { dashboardBookStore } from '../../BookStore.svelte';
	import { debug } from 'cloudflare/core.mjs';
	import { client } from '$lib/queries/api';
	echarts.use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		LegendComponent,
		BarChart,
		CanvasRenderer,
		LabelLayout,
		GridComponent,
		DatasetComponent,
		DataZoomInsideComponent,
		DataZoomSliderComponent
	]);

	const data = createQuery(function t() {
		return {
			queryKey: ['getBook', dashboardBookStore.selectedBook?.id, 'industry'],
			queryFn: async () => {
				const data = await client.rest.api.books.protected.stats.industry.$get({
					query: { book_id: dashboardBookStore.selectedBook!.id }
				});
				if (data.status != 200) throw 'failed to fetch';
				return data.json();
			},
			enabled: !!dashboardBookStore.selectedBook
		};
	});
	const source = $derived(data.isSuccess && data.data ? data.data : []);
	/* const sample = [];
	for (let x = 2000; x < 2050; x += 1) {
		sample.push([x, x]);
	} */
	onMount(() => {
		var chartDom = document.getElementById('industry_dist');
		var myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				tooltip: {
					trigger: 'item',
					formatter: ' {c}'
				},
				title: {
					top: 'top',
					left: 'center',
					text: 'Reader Industry Distribution',
					subtext: 'last 180 days'
				},
				legend: {
					left: 'center',
					top: 'bottom',
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
				dataZoom: [
					{
						show: true
					},
					{
						type: 'inside',
						start: 94,
						end: 100
					}
				],
				dataset: {
					// 提供一份数据。
					source: [
						['Industry', 'count'],
						...source.map((v) => [v.industry, v.referrer_count])
					]
				},
				xAxis: { type: 'category' },
				yAxis: {
					type: 'value'
				},
				series: {
					type: 'bar',
					label: {
						rich: {
							term: {
								fontSize: 18,
								color: 'rgb(199,86,83)'
							}
						}
					}
				}
			};
			console.log(option);
			option && myChart.setOption(option);
		});
		onDestroy(() => myChart?.dispose());
	});
</script>

<!-- markup (zero or more items) goes here -->
<div id="industry_dist" class="w-50vw h-500px" />

<style>
	/* your styles go here */
</style>
