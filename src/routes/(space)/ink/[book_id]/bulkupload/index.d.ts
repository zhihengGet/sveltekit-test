/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from '@tanstack/svelte-table';
import type { metaType } from '.';

declare module '@tanstack/svelte-table' {
	interface TableMeta<TData extends RowData> {}
	interface cellMeta<TData extends RowData> extends metaType {}
}
