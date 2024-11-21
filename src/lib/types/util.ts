export type Join<
	T extends unknown[],
	U extends string | number,
	R extends string = ''
> = T extends [infer F, ...infer Rest]
	? F extends string
		? Join<Rest, U, `${R}${U}${F}`>
		: never
	: R extends `${U}${infer Final}`
		? Final
		: R;

// "A"|"B" -> ["A","B"]
type UnionToIntersection<U> = (
	U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
	? I
	: never;

export type UnionToTuple<T> =
	UnionToIntersection<T extends never ? never : (t: T) => T> extends (
		_: never
	) => infer W
		? [...UnionToTuple<Exclude<T, W>>, W]
		: [];

type Identity<T> = { [P in keyof T]: T[P] };
export type Replace<T, K extends keyof T, TReplace> = Identity<
	Pick<T, Exclude<keyof T, K>> & {
		[P in K]: TReplace;
	}
>;
type _Overwrite<T, U> = U extends object
	? { [K in keyof T]: K extends keyof U ? _Overwrite<T[K], U[K]> : T[K] } & U
	: U;

export type ExpandRecursively<T> = T extends Function
	? T
	: T extends object
		? T extends infer O
			? { [K in keyof O]: ExpandRecursively<O[K]> }
			: never
		: T;

export type Overwrite<T, U> = ExpandRecursively<_Overwrite<T, U>>;

/**
 * @description replace deeply nested type by  tuples
 */
export type ReplaceType<obj extends object, keys extends string[], toType> = {
	[k in keyof obj]: keys extends [infer Head, ...infer Tail extends string[]] // if keys has item
		? Head extends keyof obj // if first item is key of obj
			? k extends Head // if current key matches first item
				? obj[k] extends object // if this item is object
					? ReplaceType<obj[k], Tail, toType>
					: toType // not an object
				: obj[k] // does not match head
			: obj[k]
		: obj[k];
};

export const postRestFilters = [
	'eq',
	'gt',
	'gte',
	'lt',
	'lte',
	'neq',
	'like',
	'ilike',
	'match',
	'imatch',
	'in',
	'is',
	'isdistinct',
	'fts',
	'plfts',
	'phfts',
	'wfts',
	'cs',
	'cd',
	'ov',
	'sl',
	'sr',
	'nxr',
	'nxl',
	'adj',
	'not',
	'or',
	'and',
	'all',
	'any'
] as const;
export type Nullable<T> = {
	[P in keyof T]?: T[P] | null | undefined;
};
