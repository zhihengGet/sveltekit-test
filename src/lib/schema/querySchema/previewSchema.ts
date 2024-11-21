import { MAX_PREVIEW_DURATION } from '$lib/data/constants';
import { z } from 'zod';
import { BigIntIdsZod, genZodSchemaObject } from './zodPagination';

export const previewURLSchema = z.object({
	type: z
		.string()
		.refine((type) => type === 'book' || type === 'chapter')
		.nullish(),
	chapter_id: BigIntIdsZod,
	book_id: BigIntIdsZod,
	ttl: z.number().min(1).max(MAX_PREVIEW_DURATION).nullish(),
	description: z.string().max(100),
	name: z.string().max(100),
	id: z.string().uuid().optional()
});

export const previewURLCreateSchema = z.object({
	...previewURLSchema.shape,
	ttl: z.number().min(1).max(MAX_PREVIEW_DURATION)
});

export const previewQuerySchemaGet = genZodSchemaObject(
	previewURLSchema.partial()
);
