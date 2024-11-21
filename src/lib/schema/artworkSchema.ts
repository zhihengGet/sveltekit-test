import z from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
export const artwork_user_data_schema = z.object({
	artwork_id: z.string(), // book id, review, chapter id
	is_like: z.boolean().nullish()
});

export const artwork = z.object({
	artwork_id: z.string(), // book id, review, chapter id
	name: z.boolean(),
	book_id: BigIntIdsZod,
	chapter_id: BigIntIdsZod.optional(),
	ai: z.boolean().nullish(),
	description: z.string().nullish()
});

export const artwork_user_data_create_schema = artwork_user_data_schema;
export const artwork_user_data_update_schema = artwork_user_data_schema;
