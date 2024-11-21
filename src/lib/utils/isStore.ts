import type { DefinedCreateQueryResult } from '@tanstack/svelte-query';
import { has } from 'lodash-es';
import type { Readable } from 'svelte/store';

export function isStore<T>(
	v: Readable<T> | DefinedCreateQueryResult<T> | null
): v is Readable<T> {
	return has(v, 'subscribe');
}
