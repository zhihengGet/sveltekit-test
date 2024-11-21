import type { review } from '.';
/**
 * @description selected review when you click on review to crud
 */
export type SelectedReview =
	| review
	| Pick<review, 'user_id' | 'book_id' | 'content' | 'title'>
	| null; // create
