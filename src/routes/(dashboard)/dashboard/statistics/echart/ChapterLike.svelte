<script lang="ts">
	// your script goes here
	import * as echarts from 'echarts/core';
	import {
		DataZoomInsideComponent,
		DataZoomSliderComponent,
		DatasetComponent,
		GridComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent
	} from 'echarts/components';
	import { LineChart, BarChart } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import { useGetReactivePublicChapters } from '$lib/queries';
	import { dashboardBookStore } from '../../BookStore.svelte';
	import Empty from '$lib/icons/Empty.svelte';
	import Alert from '$components/ui/alert/alert.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { sortBy } from 'lodash-es';
	echarts.use([
		GridComponent,
		LineChart,
		BarChart,
		CanvasRenderer,
		UniversalTransition,
		DataZoomSliderComponent,
		DataZoomInsideComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		DatasetComponent
	]);

	//const id = derived(BookStore, (v) => v.selectedBook?.id);
	let data = useGetReactivePublicChapters(
		() => dashboardBookStore.selectedBook!.id
	);
	const sample = [{ like_count: 1, dislike_count: 5, title: -1, sequence: 1 }];

	for (let x = 0; x < 500; x++) {
		sample.push({
			like_count: x * 10,
			dislike_count: x / 2,
			title: x,
			sequence: x
		});
	}
	// get like, dislike for public chapters
	const info = $derived.by(() => {
		let like: { like: number; title: string }[] = [];
		let dislike: { title: string; dislike: number }[] = [];
		let m = 100; // max like dislike
		for (let chapter of sortBy(data.data, (v) => v.sequence) || []) {
			like.push({
				like: chapter.like_count || 0,
				title: chapter.title
			});

			dislike.push({
				title: chapter.title,
				dislike: chapter.dislike_count || 0
			});
			if (chapter.like_count > m) m = chapter.like_count;
			if (chapter.dislike_count > m) m = chapter.dislike_count;
		}
		return [like, dislike, m] as const;
	});

	onMount(() => {
		let chartDom = document.getElementById('chapter_like');
		let myChart = echarts.init(chartDom);
		let option;
		$effect(() => {
			console.log(
				'data changed',
				dashboardBookStore.selectedBook?.title,
				data.data,
				info
			);
			option = {
				title: {
					text: 'Chapter Graph',
					subtext: dashboardBookStore.selectedBook?.title,
					left: 'center'
				},
				xAxis: {
					axisTick: {
						alignWithLabel: true
					},
					axisLabel: {
						rotate: 30,
						interval: 'auto'
					},
					type: 'category',
					data: info[0].map((v) => v.title)
				},
				yAxis: {
					type: 'value',
					min: 0,
					max: info[2]
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				},
				toolbox: {
					show: true,
					feature: {
						mark: { show: true },
						dataView: { show: true, readOnly: false },
						//magicType: { type: ['bar'] },
						restore: { show: false },
						saveAsImage: { show: true }
					}
				},
				dataZoom: [
					{
						type: 'inside',
						start: 0,
						end: 10
					},
					{
						start: 0,
						end: 10
					}
				],
				series: [
					{ type: 'bar', name: 'like count', data: info[0].map((v) => v.like) }
				]
			};
			//$inspect(info);
			option && myChart.setOption(option);
		});
		window.addEventListener('resize', myChart.resize);
		onDestroy(() => {
			console.log('removed');
			window.removeEventListener('resize', myChart.resize);
			myChart?.dispose();
		});
	});
</script>

<div class="mx-auto m-t-10">
	{#if data.data?.length == 0 || !data.data}
		<Alert class="bg-yellow-300">You have zero public chapters</Alert>
	{/if}
</div>
<div id="chapter_like" class="w-60vw h-60vh" />

<style>
	#chapter_like {
		flex-shrink: 0;
		flex-grow: 0;
		position: relative;
	}
	/* your styles go here */
</style>
