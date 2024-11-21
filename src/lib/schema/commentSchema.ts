/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
	MAX_CHAPTER_COMMENT_LENGTH,
	MAX_COMMENT_BYTE,
	MIN_CHAPTER_COMMENT_LENGTH
} from '$lib/data/constants';
import type { comment } from '$lib/types';
import { getSize, stripHTML } from '$lib/utils/fileUtils';
import { z } from 'zod';
import { BigIntIdsZod } from './querySchema/zodPagination';
import { object, string, union, number, boolean } from 'zod';
// Name has a default value just to display something in the form.
export const comment_type = ['suggestion', 'grammar', 'typo', 'plot'] as const;
export const comment_schema = z.object(
	/* <comment> */ {
		content: z
			.string()
			.refine(
				(s) => stripHTML(s).length >= MIN_CHAPTER_COMMENT_LENGTH,
				'Comment length must be >= 10'
			)
			.refine((s) => getSize(s) <= MAX_COMMENT_BYTE, 'The max size is 5KB'),
		avatar_url: z.string().nullish(),
		book_id: BigIntIdsZod.optional(),
		username: z.string().optional(),
		id: BigIntIdsZod.optional(),
		has_unread_child: z.boolean().optional(),
		tags: z.array(z.enum(comment_type)).max(10),
		section_id: BigIntIdsZod,
		chapter_id: BigIntIdsZod,
		is_unread: z.boolean().nullish(),
		parent_id: BigIntIdsZod.nullish(),
		like_count: z.number().optional(),
		dislike_count: z.number().nullish(),
		user_id: string().optional(),
		is_visible: boolean().nullish(),
		preview_session: string().uuid().nullish(),
		preview_id: string().uuid().nullish()
	}
);
export const comment_schema_create = z
	.object({
		section_id: z.string().uuid(),
		parent_id: BigIntIdsZod.nullable(),
		chapter_id: BigIntIdsZod
	})
	.merge(comment_schema);
