import { z } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
import type { user_book_data } from '$lib/types';
import { MAX_TAG_LENGTH, MAX_TAGS } from '$lib/data/constants';

export const bookTagSchema = z
	.array(z.string().max(MAX_TAG_LENGTH))
	.max(MAX_TAGS)
	.optional();
export const UserBookDataSchema = z.object(
	/* <user_book_data> */ {
		is_shelved: z.boolean(),
		/**
		 * @deprecated  use tag instead for granular control
		 */
		folder: z.string().optional(),
		book_id: BigIntIdsZod,
		tags: bookTagSchema,
		accepted_reader: z.boolean().nullish()
	}
);
