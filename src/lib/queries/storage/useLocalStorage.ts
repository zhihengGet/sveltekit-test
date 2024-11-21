import { toHTML } from '$lib/utils/toHTML';
import { createMutation, createQuery } from '@tanstack/svelte-query';
import localforage from 'localforage';
export function useSetLocalStorage() {
	return createMutation(() => { return {
		mutationFn: ({ key, value }: { key: string; value: string | object }) =>
			localforage.setItem(key, value),
		mutationKey: ['localforage']
	} });
}

export function setPreviewQueryString(file: File) {
	return encodeURI(file.name);
}
export async function getPreviewQueryString(file: File) {
	return decodeURI(file.name);
}

function fileKey(name: string) {
	return 'preview ' + name;
}
export function useSetLocalStorageFile() {
	return createMutation(() => { return {
		mutationFn: save,
		mutationKey: ['localforage']
	} });
}
// save to localstorage to be opened in another tabs
async function save(file: File) {
	const r = await toHTML(file);
	if (r instanceof Error) throw r;
	await localforage.setItem(fileKey(file.name), r);
}
export function useGetLocalStorageFile() {
	return createQuery(() => {
		return {
			queryFn: async () => {
				const urlParams = new URLSearchParams(window.location.search);
				const myParam = urlParams.get('name') ?? '';
				return await localforage.getItem(fileKey(decodeURI(myParam)));
			},
			queryKey: ['preview ' + location.href]
		};
	});
}

export function useGetLocalStorageItem(key: () => string) {
	return createQuery(() => {
		return {
			queryFn: () => localforage.getItem(key()),
			queryKey: ['upload', key()]
		};
	});
}
export function usePreview() {
	return createMutation(() => { return {
		mutationFn: async (file: File) => {
			await save(file);
			window.open(
				window.location.origin + '/preview?name=' + setPreviewQueryString(file),
				'_blank'
			);
		},
		mutationKey: ['preview']
	} });
}
