/* eslint-disable prefer-const */
import { isEqual, debounce, merge } from 'lodash-es';
import type { QueryClient } from '@tanstack/svelte-query';

export function invalidateAllComment(queryClient: QueryClient) {
	queryClient.invalidateQueries({
		predicate: (query) => {
			if (
				query.queryKey.includes('comment') &&
				query.queryKey.includes('user')
			) {
				return true;
			}
			return false;
		}
	});
}

/**
 *
 * @param new_ the new object
 * @param old  old
 * @returns deep compared object left comparison compare key in new to old, not old to new
 */
export function disjoint<T>(
	new_: T,
	old: T,
	includeFields?: (keyof T)[] | null | undefined
): Partial<T> {
	const diff: Partial<T> = {};

	for (const k in new_) {
		if (!includeFields || includeFields.includes(k))
			if (isEqual(new_[k], old[k]) == false) diff[k] = new_[k];
	}

	return diff;
} /**
 *
 * @param new_ the new object
 */
export function removeNil<T extends object>(
	data: T,
	exclude: (keyof T)[] = []
): T {
	for (const k in data) {
		if (exclude.includes(k)) continue;
		if (data[k] === null || data[k] === undefined || data[k]?.length == 0) {
			delete data[k];
		}
	}

	return data;
}
/*
 * @param convert query string back original value
 */
export function cleanQueryString<T extends object>(
	data: T,
	exclude: (keyof T)[] = []
): T {
	for (const k in data) {
		let v = data[k];
		if (exclude.includes(k)) continue;
		if (data[k] == 'null') {
			data[k] = null;
		}
		if (data[k] == 'false' || data[k] == 'true') {
			data[k] = v === 'false' ? false : true;
		}
		if (data[k] == 'undefined') {
			data[k] = undefined;
		}
	}

	return data;
}
/**
 *
 * @param fn the function to call , debounced
 * @description return a promise that will resolve if  fn is invoked, return error for fn is cancelled due to debounce after 10sec
 * @returns fn()
 */
export function debouncePromise<T, Var>(
	fn: (arg: Var) => Promise<T>,
	delay: number = 500
) {
	const deb = debounce(
		async ({ arg, resolve, reject }) => {
			resolve(await fn(arg).catch(reject));
		},
		delay,
		{ trailing: true, leading: false }
	);
	return (arg: Var) =>
		new Promise<T>((resolve, reject) => {
			deb({ arg, resolve, reject });
			setTimeout(() => reject('rejected timed out promise utils.ts'), 10000); //reject promise after 10sec so it is not hanging  there
		});
}
export function unstatAll<T>(a: T) {
	return JSON.parse(JSON.stringify(a));
}
export function delay(fn: (arg?: unknown) => unknown) {
	return new Promise((resolve, reject) =>
		setTimeout(() => resolve(fn()), 5000)
	);
}

// check if array contains another
export function contains(host: readonly any[], has: any[], not: any[] = []) {
	const s = new Set(host);

	for (const x of has) {
		if (s.has(x) == false) return false;
	}
	for (const x of not) {
		if (s.has(x)) return false;
	}
	return true;
}
import stringify from 'fast-json-stable-stringify';
import type { paginateQuery } from '$lib/types';
import { CustomError } from './base/errors';
export function partialJsonMatch(host: object, has: object) {
	if (!host || !has) return host == has;
	const str = stringify(host);
	const merged = merge(host, has);
	const str1 = stringify(merged);
	return str === str1;
}

//undefined!=null
export function matchPartialJson(
	host: (string | object)[] | object,
	has: (string | object)[] | object
) {
	console.log('----SPERATOTR---');
	console.log(host, has);
	if (Array.isArray(host) && Array.isArray(has)) {
		const hostset = new Set(host);
		if (has.length > host.length) {
			return false;
		}
		let i = -1;
		for (let x of has) {
			i += 1;
			if (hostset.has(x)) {
				continue;
			} else {
				// does not match
				if (typeof x === 'object' && typeof host[i] == 'object') {
					// do partial json match
					if (!matchPartialJson(host[i], x)) return false;
				} else {
					return false;
				}
			}
		}
		return true;
	}
	if (typeof host == 'object' && typeof has === 'object') {
		for (let k in has) {
			if (k in host) {
				let isMatch = matchPartialJson(host[k], has[k]);
				if (isMatch === false) return false;
			} else {
				return false;
			}
		}
		return true;
	}
	//if (host == has) console.warn('in match converted == is same', host, has);
	return host === has;
}
import type {
	ClientResponse,
	InferRequestType,
	InferResponseType
} from 'hono/client';

export async function responseUnwrap<T>(r: ClientResponse<T>) {
	const data = await r.json();
	if (r.status !== 200) {
		throw new CustomError(
			data?.message ??
				data?.error?.issues.map?.((v) => v.message).join(',') ??
				'Error occurred while fetching resource ' + r.url
		);
	}
	return data as T;
}
export function ResTypeNarrow<T>(
	r: { message: string; hint: string; code: string; details: string } | T
): r is T {
	if ('message' in r && 'code' in r) {
		return false;
	}
	return true;
}
