<script lang="ts">
	import { criteria } from '$lib/data/filter/rating';
	import { supabase } from '$lib/supabaseClient/client';
	import type { book_referrer } from '$lib/types/book';
	import { createQuery } from '@tanstack/svelte-query';
	import { compareAsc, subDays } from 'date-fns';
	import { PieChart, BarChart } from 'echarts/charts';
	import {
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		GridComponent,
		DatasetComponent,
		DataZoomInsideComponent,
		DataZoomSliderComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import type { ECOption } from '.';
	import { dashboardBookStore } from '../../BookStore.svelte';
	import { reduceRight, sortBy } from 'lodash-es';
	import { client } from '$lib/queries/api';
	echarts.use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		LegendComponent,
		BarChart,
		CanvasRenderer,
		GridComponent,
		LabelLayout,
		DatasetComponent,
		DataZoomInsideComponent,
		DataZoomSliderComponent
	]);

	const data = createQuery(() => {
		return {
			queryKey: ['book referrer', dashboardBookStore.selectedBook?.id],
			queryFn: async () => {
				const data = await client.rest.api.books.protected.stats.referrer.$get({
					query: { book_id: dashboardBookStore.selectedBook.id }
				});
				/* const data = await supabase
					.from('book_referrer')
					.select('created_at,referrer,num')
					.eq('book_id', dashboardBookStore.selectedBook!.id)
					.order('created_at', { ascending: false })
					.limit(365);
 */
				const ret = await data.json();
				if (data.status !== 200) throw new Error(ret.message);
				return ret;
			},
			enabled: !!dashboardBookStore.selectedBook
		};
	});
	const source = $derived(data.isSuccess && data.data ? data.data : []);
	const last_days: number = $state(1);

	const LAST = {
		DAY: 7
	};

	let mergedData = $derived.by(() => {
		return Object.entries(
			reduceRight(
				source,
				(prev, curr) => {
					const prev_ = prev[curr.referrer];
					prev[curr.referrer] = prev_ ? prev_ + curr.count : curr.count;
					return prev;
				},
				{}
			)
		).toSorted((a, b) => b[1] - a[1]);
	});
	onMount(() => {
		var chartDom = document.getElementById('referrer');
		var myChart = echarts.init(chartDom);
		$effect(() => {
			const option: ECOption = {
				tooltip: {
					trigger: 'item',
					formatter: '{a} : {c} '
				},
				title: { text: 'Referrer', subtext: 'last 60 days', left: 'center' },
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
						show: true,
						start: 94,
						end: 100
					},
					{
						type: 'inside',
						start: 94,
						end: 100
					}
				],
				dataset: {
					// 提供一份数据。
					source: [['referrer', 'num'], ...mergedData]
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
<div id="referrer" class="w-50vw h-500px" />

<style>
	/* your styles go here */
</style>
