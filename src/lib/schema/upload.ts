import { imageTypeList } from '$lib/queries/storage/constants';
import { z } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';

// ... (other imports and definitions)

export const UploadSchema = z
	.object({
		type: z.enum(imageTypeList),
		book_id: BigIntIdsZod.optional(),
		chapter_id: BigIntIdsZod.nullish(),
		artwork_id: BigIntIdsZod.optional()
	})
	.refine((input) => {
		if (input.type.includes('artwork') && !input.book_id) {
			return false;
		}
		return true;
	}, 'Artwork type missing book_id or artwork_id')
	.refine((input) => {
		if (input.type.includes('bookCover') && !input.book_id) {
			return false;
		}
		return true;
	}, 'bookCover type missing book_id');
