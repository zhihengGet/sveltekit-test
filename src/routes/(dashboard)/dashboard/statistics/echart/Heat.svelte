<script lang="ts">
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
		DataZoomSliderComponent,
		CalendarComponent,
		VisualMapComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import type { ECOption } from '.';
	import { dashboardBookStore } from '../../BookStore.svelte';
	import { client } from '$lib/queries/api';
	import { format, sub, subDays } from 'date-fns';
	import { HeatmapChart } from 'echarts/charts';
	import { WordCountHeatmapDay } from '$lib/data/constants';
	import { user } from '$lib/state/runes.svelte';
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
		DataZoomSliderComponent,
		HeatmapChart,
		CalendarComponent,
		VisualMapComponent
	]);

	const data = createQuery(function t() {
		return {
			queryKey: ['heatmap', user.id],
			queryFn: async () => {
				const data = await client.rest.api.self.protected.word.heatmap.$get();
				if (data.status != 200) throw 'failed to fetch heatmap';
				return data.json();
			},
			cacheTime: 1000 * 10,
			enabled: user.authStatus == 'signed in'
		};
	});
	const source = $derived(data.isSuccess && data.data ? data.data : []);
	const sample = [];
	function getVirtualData(year = 2024) {
		const date = +echarts.time.parse(year + '-01-01');
		const end = +echarts.time.parse(+year + '-04-01');
		const dayTime = 3600 * 24 * 1000;
		const data = [];
		for (let time = date; time < end; time += dayTime) {
			data.push([
				echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
				Math.floor(Math.random() * 10000)
			]);
		}
		return data;
	}
	onMount(() => {
		let start =
			source?.[0]?.time ||
			echarts.time.format(new Date(), '{yyyy}-{MM}-{dd}', false);
		let yearEnd = subDays(start, WordCountHeatmapDay);
		let chartDom = document.getElementById('heatmap-dist');
		let myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				tooltip: {
					trigger: 'item',
					formatter: 'data {c}'
				},
				title: {
					top: 'top',
					left: 'center',
					text: 'WordCount Heatmap',
					subtext: 'last ' + WordCountHeatmapDay + ' days'
				},
				// legend: {
				// 	left: 'center',
				// 	top: 'bottom',
				// 	data: criteria,
				// 	show: false
				// },

				toolbox: {
					show: true,
					feature: {
						mark: { show: true },
						dataView: { show: true, readOnly: false },
						restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				// dataZoom: [
				// 	{
				// 		show: true
				// 	},
				// 	{
				// 		type: 'inside',
				// 		start: 94,
				// 		end: 100
				// 	}
				// ],
				// dataset: {
				// 	// 提供一份数据。
				// 	source: [...getVirtualData()]
				// },
				visualMap: {
					min: 0,
					max: 10000,
					type: 'piecewise',
					orient: 'horizontal',
					left: 'center',
					top: 65
				},
				calendar: {
					top: 120,
					left: 30,
					right: 30,
					cellSize: ['auto', 13],
					range: source.length
						? [start, yearEnd]
						: [new Date(), subDays(new Date(), 180)],
					itemStyle: {
						borderWidth: 0.5
					},
					yearLabel: { show: false }
				},
				xAxis: { type: 'category' },
				yAxis: {
					type: 'value'
				},
				series: {
					type: 'heatmap',
					coordinateSystem: 'calendar',
					data: source.map((v) => [v.time, v.word_count])
				}
			};
			console.log(option);
			option && myChart.setOption(option);
		});
		onDestroy(() => myChart?.dispose());
	});
</script>

<!-- markup (zero or more items) goes here -->
<div id="heatmap-dist" class="w-50vw h-500px"></div>

<style>
	/* your styles go here */
</style>
