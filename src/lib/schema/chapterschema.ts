import z from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
import { MAX_BOOKMARK_LENGTH } from '$lib/data/constants';
export const chapter_user_data_schema = z.object({
	chapter_id: BigIntIdsZod, // book id, review, chapter id
	is_like: z.boolean().nullish(),
	is_bookmark: z.boolean().nullish(),
	bookmark_notes: z.string().max(MAX_BOOKMARK_LENGTH).nullish(),
	book_id: BigIntIdsZod.optional()
});
export const chapter_user_data_create_schema = chapter_user_data_schema;
export const chapter_user_data_update_schema = chapter_user_data_schema;
