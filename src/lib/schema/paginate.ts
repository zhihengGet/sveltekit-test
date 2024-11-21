import type { paginateQuery } from '$lib/types';
import zod from 'zod';

export const paginateSchema = zod.object({
	paginate: zod.object({
		page: zod.number({ coerce: true }),
		start: zod.number({ coerce: true }),
		end: zod.number({ coerce: true }),
		size: zod.number(),
		totalSize: zod.number().optional()
	}),
	filter: zod.record(zod.string()),
	search: zod.object({ regex: zod.string().optional() }),
	restFilter: zod
		.array(zod.tuple([zod.string(), zod.string(), zod.any()]))
		.optional(),
	select: zod.string()
});
