import { object, string, union, number, boolean } from 'zod';
import { BigIntIdsZod, genZodSchemaObject } from './zodPagination';

/* export const commentFiler = partial(
	object<comment>({
		avatar_url: nullish(string()),
		book_id: nullish(union([string(), number()])),
		section_id: nullish(union([string(), number()])),
		chapter_id: nullish(union([string(), number()])),
		is_unread: nullish(boolean()),
		parent_id: nullish(union([string(), number()])),
		like_count: nullish(number()),
		dislike_count: nullish(number())
	})
); */
export const reviewFilter = object({
	avatar_url: string().nullable(),
	book_id: BigIntIdsZod,
	like_count: number(),
	dislike_count: number(),
	user_id: string(),
	username: string(),
	is_visible: boolean()
}).partial();

export const reviewPaginate = genZodSchemaObject(reviewFilter);
