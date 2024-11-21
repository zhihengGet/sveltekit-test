/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
import { queryKey } from '$lib/queries/constants';
import { getLocalUser } from '$lib/queries/user';
import {
	createMutation as createMutation,
	useQueryClient
} from '@tanstack/svelte-query';

import type { chapter, ID, min_chapter } from '$lib/types';
import { toHTML } from '$lib/utils/toHTML';
import type { dataType } from '../../../routes/(space)/ink/[book_id]/bulkupload';
import { client } from '../api';
import { responseUnwrap } from '../util';

type arg = Pick<
	chapter,
	'book_id' | 'sequence' | 'title' | 'content' | 'status'
>;

export async function createChapter(data: arg) {
	const uid = (await getLocalUser()).id;
	let fillData = data;
	console.log('create chapter', data);

	const data2 = await client.rest.api.chapters.protected.create.$post({
		json: fillData
	});

	return responseUnwrap(data2);
}

export function useCreateChapter() {
	const client = useQueryClient();

	return createMutation(() => { return {
		mutationFn: createChapter,
		onSuccess: (data) => {
			//console.log('created chapter', data);
			client.setQueryData<min_chapter[] | null>(
				queryKey.getAllChapters({
					id: data.book_id
				}),
				(old) => {
					if (old) {
						return old.concat(data);
					}
					return [data];
				}
			);
		},
		meta: { toast: true }
	} });
}
function sleep(s: number) {
	return new Promise((resolve) => setTimeout(resolve, s));
}
export function useCreateBulkFiles() {
	const client = useQueryClient();

	return createMutation(() => { return {
		mutationFn: async ({
			data,
			ex,
			book_id,
			onError,
			onSuccess
		}: {
			data: readonly dataType[];
			ex: readonly Set<File>[];
			book_id: ID;
			onError: (s: File) => void;
			onSuccess?: (s: File) => void;
		}) => {
			console.log('bulk upload', data, ex);
			const valid: dataType[] = [];
			for (const y of data) {
				let found = false;
				for (const x of ex) {
					if (x.has(y.file)) {
						found = true;
						break;
					}
				}
				if (found === false && y.uploadStatus == 'validity') {
					valid.push(y);
				}
			}
			console.log('valid bulk upload', valid);
			type temp = { chapter: min_chapter; file: File };
			let savedChapters: temp[] = [];
			for (let v of valid) {
				const html = await toHTML(v.file);

				if (html instanceof Error) {
					console.log(v.title);
					onError(v.file);
					continue;
				}
				const id = book_id;
				await sleep(200); // wait for 500 so no spam
				const data = await createChapter({
					title: v.title,
					sequence: v.sequence,
					status: v.status,
					book_id: id,
					content: html
				});
				if (data) {
					onSuccess && onSuccess(v.file);
				}
				let t: temp = { chapter: data, file: v.file };
				savedChapters.push(t);
			}
			return savedChapters;
		},
		onSuccess: (data) => {},
		meta: { toast: false }
	} });
}
