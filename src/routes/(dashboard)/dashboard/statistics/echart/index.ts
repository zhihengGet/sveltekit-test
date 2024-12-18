import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	// Dataset
	DatasetComponent,
	// Built-in transform (filter, sort)
	TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {
	// The series option types are defined with the SeriesOption suffix
	BarSeriesOption,
	HeatmapSeriesOption,
	LineSeriesOption,
	PieSeriesOption
} from 'echarts/charts';
import type {
	// The component option types are defined with the ComponentOption suffix
	TitleComponentOption,
	TooltipComponentOption,
	GridComponentOption,
	DatasetComponentOption
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

// Create an Option type with only the required components and charts via ComposeOption
export type ECOption = ComposeOption<
	| BarSeriesOption
	| LineSeriesOption
	| TitleComponentOption
	| TooltipComponentOption
	| GridComponentOption
	| DatasetComponentOption
	| PieSeriesOption
	| HeatmapSeriesOption
>;
