import type { table_names } from '.';

/**
 * @description  offset based pagination , maybe change to keyset based later
 * @property {number} page   - page number which page are we on
 * @property {number} lastID - in previous page , what was the last entity fetched id, used to skip
 * @property {number} size   - size per page
 * @property {string} order  - order the rows by what
 * @property {string} lastOrderValue  - order the rows by what
 * @property {boolean} asc   - ascending or descending
 */
export type paginateTypes<T> = {
	/**
	 * @deprecated
	 */
	page?: number;
	lastID?: number | null; // keyset based ?
	/**
	 * @description TODO can be infer from start and end
	 * @deprecated
	 */
	size?: number;
	/**
	 * @deprecated use orderWithMultiple
	 */
	orderWith?: keyof T | null;
	orderWithMultiple?: Partial<orderMultiple<T>>;
	lastOrderValue?: number | string | null;
	/**
	 * @deprecated use orderWithMultiple
	 */
	asc?: boolean;
	start: number;
	end: number;
	/**
	 * @deprecated don't need to add totalSize to query
	 */
	totalSize?: number;
};
type orderMultiple<T> = { [s in keyof T]: { asc: boolean } };
/* export type paginateTypes_range<T> = {
	size?: number;
	orderWith?: keyof T;
	orderWithMultiple?: Partial<{ [s in keyof T]: { asc: boolean } }>;
	lastOrderValue?: number | string | null;
	asc?: boolean;
	start: number;
	end: number;
}; */
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type query<T, U = {}, G extends keyof T = {}> = {
	paginate: paginateTypes<T>;
	filter: [G] extends [keyof T] ? Pick<T, G> : Partial<T>; // custom filter that needs custom handling
	//customFilter?: [G] extends ["eq","lte","lt","gt","gte","range","contains"] ? Pick<T, G> : Partial<T>;
	restFilter?: [string, string, any][]; // filter() expects you to use the raw PostgREST syntax for the filter values.
	search?: { regex?: string };
	join?: {
		// multiple join options
		table?: table_names[];
		// single join
		withUserInfo: boolean;
		inner?: boolean;
		filter?: Partial<U>; // filter applied on join , can just specify in resetFilter
	}; // do we want to fetch user info data alone with book,review, or comments?,
	options?: {
		shouldDebounce?: boolean;
		debDelay?: number;
		queryKeyConst?: string;
		countOnly?: boolean;
		/**
		 * exact : Note that the larger the table the slower this query runs in the database.
		 * @description if enabled only count will be returned
		 */
		countStrategy?: 'exact' | 'planned' | 'estimated'; // get total count ? or paginate without total count
	};
	extra?: object; // extra payload that is required for filter
};

export type paginateQuery<
	T,
	U = {},
	G extends keyof T = {}
> = /* 	| PartialBy<query<T, U, G>, 'filter'>
	| */ query<T, U, G>;
