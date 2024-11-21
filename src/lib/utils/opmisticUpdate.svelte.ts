import type {
	CreateBaseMutationResult,
	CreateMutationResult,
	Mutation,
	MutationFunction
} from '@tanstack/svelte-query';
import { debounce } from 'lodash-es';
import { untrack } from 'svelte';

export function useOptimisticUpdate<T, A, B, C, D>(
	props: () => {
		mutations: CreateBaseMutationResult<A, B, C, D>[];
		dataParent: T;
	}
) {
	let optimisitcValue = $state($state.snapshot(props().dataParent)) as T;
	const sync = () => {
		if (typeof optimisitcValue === 'object' && optimisitcValue !== null)
			Object.assign(optimisitcValue, $state.snapshot(props().dataParent));
		else {
			optimisitcValue = props().dataParent;
		}
	};
	$effect(() => {
		for (let x of props().mutations) {
			if (x.isError) {
				// if any mutatione rrored
				untrack(sync);
			}
		}
	});
	/// if original value update, we sync with it, i.e when server returns
	$effect(() => {
		if (props().dataParent) {
			untrack(sync);
		}
	});
	//const debouncer = debounce();
	return [
		() => optimisitcValue,
		(value: T) => {
			optimisitcValue = value;
		},
		...props().mutations.map((v) => debounce(v.mutate, 200))
	] as const;
}
