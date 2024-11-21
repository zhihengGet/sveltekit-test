import { BOOK_LIMITATIONS } from '$lib/data/constants';
import { bookFilter, status } from '$lib/data/filter';
import { number, z } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
import type { book } from '$lib/types';
import { primaryAudienceOptions } from '$lib/data/filter/age';
export const bookSchema = z.object(
	/* <book> */ {
		id: BigIntIdsZod.optional(),
		authors_words: z.string().min(0).trim().default(''),
		title: z
			.string({ message: 'Title is needed!' })
			.trim()
			.min(BOOK_LIMITATIONS.MIN_TITLE_LENGTH, 'Please enter a nice title')
			.max(
				BOOK_LIMITATIONS.MAX_TITLE_LENGTH,
				`Max title length is ${BOOK_LIMITATIONS.MAX_TITLE_LENGTH}`
			),
		summary: z
			.string()
			.trim()
			.max(
				BOOK_LIMITATIONS.MAX_SUMMARY_LENGTH,
				'Summary too long ! Must be less than' +
					BOOK_LIMITATIONS.MAX_SUMMARY_LENGTH
			)
			.min(
				BOOK_LIMITATIONS.MIN_SUMMARY_LENGTH,
				'Summary too short! Must be > ' + BOOK_LIMITATIONS.MIN_SUMMARY_LENGTH
			)
			.default(``),
		price: z
			.string()
			.or(number())
			.refine((v) => !isNaN(+v))
			.default('0'),
		category: z
			.string()
			.min(1, 'Please enter an category')
			.default('')
			.refine((v) => {
				return bookFilter.category.map((v) => v.value).includes(v);
			}),
		language: z.string().default('English'),
		tags: z.array(z.string()),
		lead: z.string(),
		status: z.enum([...status, 'draft']).default('draft'),
		//age_range: z.string().nullish(),
		display_name: z.string().nullish(),
		cover_url: z.string().optional(),
		is_visible: z.boolean().optional(),
		maturity_levels: z.array(z.string()).max(5).nullable().default([]),
		author_id: z.string().uuid().optional(),
		created_at: z.string().optional(),
		user_modified_at: z.string().optional(),
		character_count: z.number().optional(),
		average_rating: z.number().optional(),
		author_name: z.string().optional(),
		audience: z
			.string({
				message: 'Please select an primary audience!'
			})
			.refine((v) => {
				return primaryAudienceOptions.map((v) => v.value).includes(v);
			})
		//chapter_count: z.number().optional()
		//like_count: z.number().optional()
		/* author_name: z.string().optional(),
	author_id: z.string().uuid().optional(),
	cover_url: z.string().optional(),
	id: BigIntIdsZod.optional() */
	}
);
export const bookUpdateSchema = bookSchema
	.partial()
	.extend({ id: BigIntIdsZod });
export const bookSchemaCreate = bookUpdateSchema.omit({ id: true });
export const bookSchemaQuery = z.object({
	//authors_words: z.string().min(0).trim().default('').nullable(),
	title: z
		.string()
		.trim()
		.min(BOOK_LIMITATIONS.MIN_TITLE_LENGTH, 'Please enter a nice title')
		.max(BOOK_LIMITATIONS.MAX_TITLE_LENGTH)
		.nullable(),
	//price: z.number().default(0),
	category: z.string().min(1, 'Please enter an category').nullable(),
	language: z.string().min(2).default('English'),
	tags: z.array(z.string()).max(10),
	lead: z.string(),
	status: z.enum([...status, 'draft']).default('draft'),
	//age_range: z.coerce.number().max(100).min(10).nullish(),
	age_range: z
		.array(z.number())
		.length(2)
		.refine((v) => v[1] >= v[0])
		.transform((v) => `[${v.toString()}]`)
		.or(z.string().startsWith('[').endsWith(']'))
		.refine((v) => v.split(',').length == 2),
	display_name: z.string().nullish()
	/* author_name: z.string().optional(),
	author_id: z.string().uuid().optional(),
	cover_url: z.string().optional(),
	id: BigIntIdsZod.optional() */
});
