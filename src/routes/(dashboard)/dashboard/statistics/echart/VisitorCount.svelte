<script lang="ts">
	import { criteria } from '$lib/data/filter/rating';
	import { getBook } from '$lib/queries';
	import type { book_day_click } from '$lib/types/book';
	import { createQuery } from '@tanstack/svelte-query';
	import { PieChart } from 'echarts/charts';
	import {
		DataZoomInsideComponent,
		DatasetComponent,
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
	import { supabase } from '$lib/supabaseClient/client';
	import { client } from '$lib/queries/api';
	import { compareAsc } from 'date-fns';
	echarts.use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		LegendComponent,
		PieChart,
		CanvasRenderer,
		LabelLayout,
		DatasetComponent,
		DataZoomInsideComponent,
		DataZoomSliderComponent
	]);

	const data = createQuery(() => {
		return {
			queryKey: [
				'visitor count',
				'book_clicks',
				dashboardBookStore.selectedBook?.id
			],
			queryFn: async () => {
				{
					const res = await client.rest.api.books.protected.stats.clicks.$get({
						query: { book_id: dashboardBookStore.selectedBook!.id + '' }
					});
					const data = await res.json();
					if (res.status !== 200) throw new Error(data.message);
					return data
						.map((v) => [v.created_at, v.clicks])
						.sort((a, b) => {
							return compareAsc(a[0], b[0]);
						});
				}
			},
			enabled: !!dashboardBookStore.selectedBook
		};
	});
	const source = $derived(data.isSuccess && data.data ? data.data : []);

	onMount(() => {
		var chartDom = document.getElementById('click_line');
		var myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				tooltip: {
					trigger: 'item',
					formatter: '{a} <br/>{b} : {c} '
				},
				title: {
					top: 'top',
					left: 'center',
					text: 'Visitor Click Count',
					subtext: 'last 90 days'
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
				dataset: {
					// 提供一份数据。
					source: [['time', 'click count'], ...source]
				},
				dataZoom: [
					{
						type: 'slider'
					}
				],
				xAxis: { type: 'category' },
				yAxis: {
					type: 'value'
				},
				series: { type: 'line' }
			};
			console.log(option);
			option && myChart.setOption(option);
		});
		onDestroy(() => myChart?.dispose());
	});
</script>

<!-- markup (zero or more items) goes here -->
<div id="click_line" class="w-50vw h-500px" />

<style>
	/* your styles go here */
</style>
