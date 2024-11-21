import {
	createTable,
	type RowData,
	type TableOptions,
	type TableOptionsResolved
} from '@tanstack/table-core';
import { merge } from 'lodash-es';

function mergeProps(...props: any[]) {
	return merge(...props);
}
export function createSvelteTable<TData extends RowData>(
	options: TableOptions<TData>
) {
	const resolvedOptions: TableOptionsResolved<TData> = $state(
		mergeProps(
			{
				state: {}, // Dummy state
				onStateChange: () => {}, // noop
				renderFallbackValue: null,
				mergeOptions: (
					defaultOptions: TableOptions<TData>,
					options: Partial<TableOptions<TData>>
				) => {
					// called after setOptions
					console.log(
						'🚀 ~ file: +page.svelte:37 ~ defaultOptions: TableOptions<TData>',
						defaultOptions,
						options
					);

					return options as TableOptions<TData>;
				}
			},

			options
		)
	);
	const table = createTable<TData>(resolvedOptions);
	$effect.pre(() => {
		table.setOptions((prev) => {
			console.log(
				'🚀 ~ file: createSvelte.svelte.ts:42 ~ table.setOptions ~ prev:',
				prev
			);
			return options;
		});
	});
	return table;
}
