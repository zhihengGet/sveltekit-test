/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MAX_REVIEW_CONTENT_BYTE, reviewLimits } from '$lib/data/constants';
import { getSize, stripHTML } from '$lib/utils/fileUtils';
import { z } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
// Name has a default value just to display something in the form.

const type = z.preprocess((v) => v, z.coerce.number().gte(0).default(0));
export const review_schema = z.object({
	title: z
		.string()
		.trim()
		.max(reviewLimits.MAX_TITLE_LENGTH)
		.min(5, 'Title Must have at least 5')
		.default(''),
	level_of_immersion_rating: type,
	character_development_rating: type,
	world_setting_rating: type,
	writing_rating: type,
	plot_rating: type,
	content: z
		.string()
		.trim()
		.min(
			reviewLimits.MIN_BODY_LENGTH,
			'Review content length should be >=200  '
		)
		.refine(
			(s) => getSize(s) <= MAX_REVIEW_CONTENT_BYTE,
			(v) => ({
				message: `Review Content size should be less than ${MAX_REVIEW_CONTENT_BYTE / 1000}KB; You have ${getSize(v) / 1000}kb`
			})
		)
		.refine(
			(s) => stripHTML(s).length < reviewLimits.MAX_BODY_LENGTH,
			`Review Content length should be less than ${reviewLimits.MAX_BODY_LENGTH}`
		),
	book_id: BigIntIdsZod.optional(),
	username: z.string().optional()
});
