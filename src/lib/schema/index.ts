import {
	MAX_CHAPTER_BYTE,
	MAX_CHAPTER_STRIPED_HTML_LENGTH,
	chapterLimits
} from '$lib/data/constants';
import { z } from 'zod';

export { bookSchema } from './bookSchema';
export type bookSchema = z.infer<typeof bookSchema>;

export const createChapterSchema = z.object({
	title: z
		.string({
			invalid_type_error: 'Please enter title',
			required_error: 'Title Required'
		})
		.trim()
		.min(chapterLimits.MIN_TITLE_LENGTH)
		.max(chapterLimits.MAX_TITLE_LENGTH),
	/* .default('The wheel of time') */ //.nullish()
	sequence: z.coerce
		.number({ invalid_type_error: 'Please enter an number for sequence' })
		.max(chapterLimits.MAX_SEQUENCE)
		.min(chapterLimits.MIN_SEQUENCE / 2)
		.optional(),
	content: z
		.string()
		.nullish()
		.refine(
			(s) => getSize(s ?? '') < MAX_CHAPTER_BYTE,
			'Content size in byte should be less than ' +
				MAX_CHAPTER_BYTE / 1e3 +
				'kb'
		)
		.refine(
			(s) => stripHTML(s ?? '').length < MAX_CHAPTER_STRIPED_HTML_LENGTH,
			'Content length should be less than ' + MAX_CHAPTER_STRIPED_HTML_LENGTH
		),
	authors_words: z.string().max(1000).default(''),
	author_id: z.string().optional(),
	book_id: BigIntIdsZod.optional(),
	id: BigIntIdsZod.optional(),
	status: z.enum(chapter_status).nullish(),
	lang: z
		.string()
		.refine((v) => {
			return lang.map((v) => v.name).includes(v);
		})
		.optional()
});

export const chapterSchema = createChapterSchema;

export type createChapterSchema = z.infer<typeof createChapterSchema>;
import { defaults } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getSize, stripHTML } from '$lib/utils/fileUtils';
import { BigIntIdsZod } from './querySchema/zodPagination';
import { chapter_status } from '$lib/data/dbConstants';
import { lang } from '$lib/data/filter';

export const validatedChapter = defaults(zod(createChapterSchema));
