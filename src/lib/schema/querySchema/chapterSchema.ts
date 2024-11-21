import { bookFilter } from '$lib/data/filter';
import { genZodSchemaObject, genZodSchema } from './zodPagination';
import { statusToActions } from '$lib/data/dbConstants';
import { keys } from '$lib/utils/getKeys';
import z from 'zod';
import { BigIntIdsZod } from './zodPagination';

// Assuming you have these predefined somewhere in your code
const languageSubLabelValues = Object.values(
	bookFilter.objectLabel.language.subLabelValues
);
const statusKeys = keys(statusToActions);
const filter = z.object({
	session_id: z.string().uuid().nullish(),
	language: z.enum(languageSubLabelValues).nullish(),
	book_id: BigIntIdsZod,
	chapter_id: BigIntIdsZod.nullish(),
	sequence: BigIntIdsZod.nullish(),
	created_at: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: 'Invalid date format'
		})
		.nullish(),
	updated_at: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: 'Invalid date format'
		})
		.nullish(),
	author_id: z.string().uuid().nullish(),
	id: BigIntIdsZod.nullish(),
	status: z.enum(statusKeys).nullish()
});
export const chapterSchemaGet = genZodSchema(filter);
export const chapterSchema = genZodSchemaObject(filter);
