import { deserializeFilter } from '$lib/state';
import {
	coerce,
	object,
	string,
	record,
	boolean,
	array,
	ZodObject,
	number,
	type ZodRawShape,
	ZodString
} from 'zod';
const num = coerce.number().min(0);
export const page = object({
	end: num,
	start: num,
	last_cursor: string().or(number()).optional().nullish(),
	orderWithMultiple: record(string(), object({ asc: boolean() }))
		.refine(
			(v) => {
				let size = Object.keys(v).length;
				if (size > 3) {
					return false;
				}
				return true;
			},
			{ message: 'Max Order By is < 3 ' }
		)
		.nullish(),
	page: num.optional(),
	orderWith: string().nullish(),
	asc: boolean().nullish(),
	size: num.optional()
});
const search = object({ regex: string().optional() }).nullish();
export const BigIntIdsZod = string().uuid() as any as ZodString;
export function genZodSchemaObject<T, B extends ZodRawShape>(
	filter: ZodObject<B>
) {
	const paginateFilter = object({
		filter: filter,
		paginate: page,
		search: search,
		options: object({ countStrategy: string().nullish() }).partial().optional(),
		restFilter: array(array(string().min(1)).length(3)).nullish(),
		join: object({
			table: array(string()).nullish(),
			withUserInfo: boolean(),
			inner: boolean().nullish(),
			filter: object({
				is_shelved: boolean(),
				user_id: string().uuid(),
				folder: string()
			})
				.partial()
				.nullish()
		}).nullish()
	});

	return paginateFilter;
}
export function genZodSchema<T, B extends ZodRawShape>(filter: ZodObject<B>) {
	const paginateFilter = object({
		filter: filter,
		paginate: page,
		search: search,
		options: object({ countStrategy: string().nullish() }).partial().optional(),
		restFilter: array(array(string().min(1)).length(3)).nullish(),
		join: object({
			table: array(string()).nullish(),
			withUserInfo: boolean(),
			inner: boolean().nullish(),
			filter: object({
				is_shelved: boolean(),
				user_id: string().uuid(),
				folder: string()
			})
				.partial()
				.nullish()
		}).nullish()
	});

	return object({ payload: string() }).transform((v) => {
		const deserialize = deserializeFilter(v.payload);
		const val = paginateFilter.safeParse(deserialize);

		if (val.success) {
			return val.data;
		}
		console.log(JSON.stringify(val.error, null, 2));
		throw new Error('invalid zod input');
	});
}
/* const t = genZodSchemaObject(object({ id: number() })); */
