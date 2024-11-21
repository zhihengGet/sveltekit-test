<script lang="ts">
	import {
		createTable,
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState,
		type TableOptions,
		getPaginationRowModel,
		getFilteredRowModel,
		type ColumnFiltersState,
		type ColumnHelper,
		createColumnHelper,
		type PaginationState,
		type PaginationTableState
	} from '@tanstack/table-core';

	import FileUpload from '$components/FileUpload.svelte';
	import Table from '$components/ui/table/table.svelte';
	import type { bulk_file_status, dataType } from '.';
	import DataTableCell from './data-table-cell.svelte';
	import { usePreview } from '$lib/queries/storage/useLocalStorage';
	import { merge, uniqBy } from 'lodash-es';
	import { onMount, untrack } from 'svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import { filename, toMb } from '$lib/utils/fileUtils';
	import { FILE_SIZE_LIMIT, chapterLimits } from '$lib/data/constants';

	import { queryKey, useCreateBulkFiles } from '$lib/queries';
	import { InkStore } from '../../../store.svelte';
	import { toHTML } from '$lib/utils/toHTML';
	import Button from '$components/button.svelte';
	import { toastNotify } from '$lib/utils/toast';
	import Status from './status.svelte';
	import SvelteRender from './SvelteRender.svelte';
	import { updated } from '$app/stores';
	import { createSvelteTable } from './createSvelte.svelte';
	import { chapterSchema } from '$lib/schema';
	let sizeExceedFiles = $state<Set<File>>(new Set());
	let skipFiles = $state<Set<File>>(new Set());
	let conversionFailed = $state<Set<File>>(new Set());
	/* let fileStatus: Writable<Map<File, keyof typeof bulk_file_status>> = writable(
		new Map()
	); */
	let isChecking = $state(true);
	const preview = usePreview();
	const columnHelper = createColumnHelper<dataType>();

	const columns: ColumnDef<dataType>[] = [
		{
			header: 'Book Info',
			footer: (props) => {
				props.column.id;
			},
			columns: [
				{
					accessorKey: 'status', //WARN not chapter status but upload status
					id: 'status',
					cell: (info) => Status,
					meta: { editable: false, sortable: false },
					enableColumnFilter: true,
					filterFn: 'includesString'
				},
				{
					accessorKey: 'errors',
					id: 'errors',
					cell: (info) => info.getValue(),
					meta: { editable: false, sortable: false },
					enableColumnFilter: true,
					filterFn: 'includesString'
				},
				{
					accessorKey: 'sequence',
					id: 'sequence',
					meta: { editable: true, sortable: false },
					enableColumnFilter: true,
					filterFn: 'includesString'
				},
				{
					accessorFn: (row) => row.title,
					id: 'title',
					cell: (info) => info.getValue(),
					header: () => 'Title',
					meta: { editable: true, sortable: true },
					sortingFn: 'alphanumeric',
					enableColumnFilter: true
				},
				{
					accessorFn: (row) => row.lastModified,
					id: 'lastModified',
					cell: (info) => timeAgo(info.getValue()),
					header: () => 'Last Modified',
					meta: { editable: false, sortable: true },
					enableColumnFilter: false
				},
				{
					accessorFn: (row) => row.file.size,
					cell: (info) => {
						return (
							toMb(info.getValue()) +
							'/' +
							chapterLimits.MAX_BODY_SIZE_MEGABYTE / 1000000
						);
					},
					id: 'Size',
					header:
						'Size(' + chapterLimits.MAX_BODY_SIZE_MEGABYTE / 1000000 + 'mb)',
					enableSorting: false,
					meta: {
						editable: false,
						click: toggleSkpped,
						sortable: false
					},
					enableColumnFilter: false
				}
				/* {
					accessorFn: (row) => row,
					cell: (info) => {
						const r = createChapterSchema.safeParse(info.getValue());
						//	console.log('test content result', r);
						if (r.success) return 'Success';
						return r.error?.issues.map((v) => v.message).join('\n');
					},
					id: 'Validation',
					header: 'Validation',
					enableSorting: false,
					meta: {
						editable: false,
						click: toggleSkpped,
						sortable: false
					},
					enableColumnFilter: false
				} */
			]
		},
		{
			header: 'Action',

			columns: [
				{
					accessorFn: () => '👁️',
					header: () => 'Preview',
					id: 'preview',
					cell: () => '👁️',
					enableSorting: false,
					meta: {
						editable: false,
						click: (row: dataType) => preview.mutate(row.file)
					},
					enableColumnFilter: false
				},
				{
					accessorFn: () => '🚫',
					cell: (info) => {
						return info.getValue();
					},
					id: 'ignore',
					header: 'Skip',
					enableSorting: false,
					meta: {
						editable: false,
						click: toggleSkpped
					},
					enableColumnFilter: false
				},

				{
					accessorFn: () => '🗑️',
					cell: (info) => {
						return info.getValue();
					},
					id: 'delete',
					header: 'Del',
					enableSorting: false,
					meta: {
						editable: false,
						click: removeFile
					},
					enableColumnFilter: false
				}
			]
		}
	];
	function toggleSkpped({ file }: dataType) {
		if (skipFiles.has(file)) {
			skipFiles.delete(file);
		} else skipFiles.add(file);
		skipFiles = skipFiles;
	}
	function removeFile({ file }: dataType) {
		console.log('about to remove', file, options.data);
		options.data = options.data.filter((v) => v.file != file);
		let count = options.data.filter(
			(v) => v.uploadStatus === 'validity'
		).length;
		validFile = count;
		console.log('remove', options.data);
	}
	const f = new File(['hello'], 'a very long name.docx');
	const f1 = new File(['hello'], 'b.docx', {
		lastModified: Date.now() - 1000000
	});
	const f2 = new File(
		[JSON.stringify({ hello: '123' }, null, 2)],
		'test2.docx',
		{
			lastModified: 2
		}
	);
	let files: File[] = [f, f1, f2];
	let data = $state(
		import.meta.env.PROD ? [] : [] /* files.map((v, index) => {
					return {
						title: v.name,
						sequence: index,
						status: 'draft',
						lastModified: new Date(v.lastModified),
						file: v
					} as dataType;
				}) */
	);

	let sorting: SortingState = [];

	const setSorting = (
		updater: SortingState | ((arg: SortingState) => SortingState)
	) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}

		options.state!.sorting = sorting;
	};

	const setPage = (
		updater: PaginationState | ((arg: PaginationState) => PaginationState)
	) => {
		if (updater instanceof Function) {
			options.state!.pagination = updater(options.state!.pagination);
		} else {
			options.state!.pagination = updater;
		}
	};

	const setFilter = (
		updater:
			| ((arg: ColumnFiltersState) => ColumnFiltersState)
			| ColumnFiltersState
	) => {
		console.log(updater);

		if (updater instanceof Function) {
			columnFiltr = updater(columnFiltr);
			console.log(columnFiltr);
		} else {
			console.log('what');
			columnFiltr = updater;
		}
		console.log('start update', columnFiltr);
		if (options.state == null) {
			options.state = {};
		}
		options.state.columnFilters = columnFiltr;
		/* options={
			...options,
			state: {
				...options.state,
				columnFilters: columnFiltr
			}
		} */
	};

	let columnFiltr: ColumnFiltersState = [];

	let options = $state<TableOptions<dataType>>({
		data: $state.snapshot(data),
		columns,
		state: {
			columnFilters: columnFiltr,
			sorting: sorting,
			pagination: { pageIndex: 0, pageSize: 2 },
			columnPinning: {}
		},
		enableFilters: true,
		enableColumnPinning: false,
		autoResetPageIndex: true,
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setFilter,
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPage,
		debugTable: true
	});

	const table = createSvelteTable(options);

	let currFiles: File[] = $state([]);
	let startingSequence: number = $state(0);
	let sequenceStepBy: number = $state(1);

	// convert files [] into dataType
	function makeData(files: File[]): dataType[] {
		return files.map((v, i) => {
			return {
				sequence: i,
				status: 'draft',
				title: v.name,
				file: v,
				content: '',
				uploadStatus: 'skip',
				errors: '',
				lastModified: new Date(v.lastModified)
			};
		});
	}
	import DOMPurify from 'dompurify';
	import queryClient from '$lib/queries/client';
	import { dashboardBookStore } from '../../../../(dashboard)/dashboard/BookStore.svelte';
	let validFile = $state(0);
	//const cache = new Map()
	async function updateData(newData: File[]) {
		isChecking = true;
		const v = $state.snapshot(options.data);

		let temp = makeData(newData);
		validFile = 0;
		let n = v.concat(temp);
		n = uniqBy(n, (v) => v.file.name + v.file.lastModified + v.file.type);
		console.log('received new file, checking them, current total files:', n);
		let count = 0;
		for (let v of n) {
			if (toMb(v.file.size) > chapterLimits.MAX_BODY_SIZE_MEGABYTE) {
				v.uploadStatus = 'size';
				continue;
			}

			let body = await toHTML(v.file);
			// remove head tag, script tags
			body = DOMPurify.sanitize(body, {
				FORBID_TAGS: ['head', 'style']
			});
			if (body instanceof Error) {
				// conversed
				v.uploadStatus = 'conversion';
				continue;
			}

			const data = {
				content: body,
				title: action.hideExtension
					? v.title.substring(0, v.title.lastIndexOf('.')) || v.title
					: v.title,
				sequence: v.sequence,
				status: v.status
			};
			const res = chapterSchema.safeParse(data);
			v.content = body;
			if (res.success == false) {
				console.log('validate file error', res.error.issues);
				v.errors = res.error.issues.map((v) => v.message).join('');
				v.uploadStatus = 'validationFailed';
				continue;
			}
			v.title = res.data.title;
			validFile += 1;
			v.sequence = count++;
			v.uploadStatus = 'validity';
		}
		options.data = n;
		isChecking = false;
		console.log('update');
	}
	const upload = useCreateBulkFiles();

	function uploadValidFiles() {
		conversionFailed = new Set();
		upload.mutate(
			{
				data: $state.snapshot(options.data),
				ex: $state.snapshot([skipFiles, sizeExceedFiles]),
				book_id: InkStore.book!.id,
				onError: (file) => {
					toastNotify.error('error occurred ' + file.name);
				}
			},
			{
				onSettled: (file) => {
					if (file) {
						const s = new Set(file.map((v) => v.file));
						options.data = options.data.filter((v) => s.has(v.file) === false);
						currFiles = currFiles.filter((v) => !s.has(v));
						validFile -= file.length;
						toastNotify.success('uploaded successful! ');
						queryClient.invalidateQueries({
							queryKey: queryKey.getAllChapters({
								id: dashboardBookStore.selectedBook?.id
							})
						});
					}
				}
			}
		);
	}

	let action = $state({ hideExtension: true });
	$effect.pre(() => {
		if (action.hideExtension !== undefined)
			untrack(() => updateData(currFiles)); // update table data

		console.log(currFiles, 'current files');
	});
	const icons = {
		asc: ' 🔼',
		desc: ' 🔽',
		false: ' 🔼'
	};
	$inspect('updating', options.data);
</script>

<div class="px-2">
	<h1>Constraints</h1>
	<ol class="list-circle list-inside">
		<li>Max File Size: {chapterLimits.MAX_BODY_SIZE_MEGABYTE / 1e6}mb</li>
		<li>Max character count: {chapterLimits.MAX_CHAPTER_CONTENT_LENGTH}</li>
		<li>Style will not be preserved due to conversion</li>
		<li>For html files, style,head,script tags will be removed;</li>
	</ol>
	<!-- 	<label>starting sequence number</label>
	<input type="number" placeholder="" value={startingSequence} /> -->

	<div class="bg-gray-100 m-2 p-3">
		<h3 class="font-600">Actions</h3>
		<div>
			<input
				type="checkbox"
				id="ext_removal"
				bind:checked={action.hideExtension}
			/>
			<label for="ext_removal">Remove Title Extensions</label>
		</div>
	</div>
	<FileUpload
		displayPreview={false}
		bind:fileArray={currFiles}
		uploadUI={false}
		multiple={true}
		accept=".txt,.docx,.html"
	/>

	<Table class="table-fixed">
		<thead>
			{#each table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<th colSpan={header.colSpan}>
							{#if !header.isPlaceholder}
								<div
									class:cursor-pointer={header.column.getCanSort()}
									class:select-none={header.column.getCanSort()}
								>
									<button
										onclick={header.column.getToggleSortingHandler()}
										class=""
									>
										<p>
											{typeof header.column.columnDef.header == 'function'
												? header.column.columnDef.header(header.getContext())
												: header.column.columnDef.header}
										</p>

										<!-- 	<svelte:component
											this={flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										/> -->

										{#if header.subHeaders.length == 0 && header.column.columnDef.enableSorting != false}
											{@const sorted = header.column.getIsSorted()}
											{sorted ? icons[sorted] : ' 🔼'}
										{/if}
									</button>

									{#if header.column.getCanFilter()}
										<input
											class="border-1 my-1 py-1 max-w-full w-90% border-gray-300 bg-neutral-100"
											placeholder=" Filter"
											oninput={(e) => {
												if (e.target)
													header.column.setFilterValue(e.target.value);
											}}
										/>
									{/if}
								</div>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each table.getRowModel().rows as row}
				<tr class="h-15 text-center text-ellipsis">
					{#each row.getVisibleCells() as cell}
						{@const file = cell.row.original.file}
						{@const isValid =
							skipFiles.has(file) ||
							cell.row.original.uploadStatus != 'validity'}

						<td class={isValid ? ' opacity-50 ' : ''}>
							<DataTableCell
								{cell}
								on:update={(e) => {
									console.log('clicked cell update value', e);
									options.data = options.data.map((data, index) => {
										if (index == cell.row.index) {
											data[cell.column.id] = e.detail;
											return data;
										}
										return data;
									});
								}}
							/>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<tfoot>
			{#each table.getFooterGroups() as footerGroup}
				<tr>
					{#each footerGroup.headers as header}
						<th colSpan={header.colSpan}>
							{#if !header.isPlaceholder}
								<SvelteRender
									ui={header.column.columnDef.footer}
									context={header.getContext()}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</tfoot>
	</Table>
	<div>{table.getRowModel().rows.length} Rows</div>
	<!-- <pre>{JSON.stringify(table.getState().sorting, null, 2)}</pre> -->
</div>
<div class="flex items-center justify-end space-x-2 py-4">
	<div class="flex-1 text-sm text-muted-foreground">
		Page {table.getState().pagination.pageIndex} of {table.getPageCount()}
		<!--  - [Valid
		Files: {$options.data.length - $skipFiles.size - $conversionFailed.size}] -
		[Skipped:{$skipFiles.size}] - [Invalid:{$sizeExceedFiles.size}]
		<b>- [Conversion Error:{$conversionFailed.size}]</b> -->
	</div>
	<Button
		onclick={table.previousPage}
		disabled={table.getCanPreviousPage() == false}
	>
		{'<Prev '}
	</Button>
	<Button
		disabled={!table.getCanNextPage()}
		onclick={() => {
			table.nextPage();
			console.log('go next page');
		}}
	>
		{'Next >'}
	</Button>
	<select
		value={table.getState().pagination.pageSize}
		class="border-1"
		onchange={(e) => {
			if (e.target) table.setPageSize(Number(e.target.value));
		}}
	>
		{#each [2, 6, 10, 20, 30, 40, 50] as item}
			<option value={item}>
				Show {item}
			</option>
		{/each}
	</select>
</div>
<Button
	isLoading={upload.isPending || isChecking}
	onclick={uploadValidFiles}
	disabled={validFile == 0 || upload.isPending}
>
	{isChecking ? 'checking...' : 'Upload'}
	{validFile} File(s)
</Button>

<!-- <pre class="h-20 overscroll-auto">{JSON.stringify(
		table.getState(),
		null,
		2
	)}</pre> -->

<style>
	th,
	td,
	tr {
		border: 1px solid green;
	}
</style>
