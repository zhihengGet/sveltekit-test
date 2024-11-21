import type { Join, review, user_review_data } from '$lib/types';
import { profilePublicField } from '../user/fields';

/**
 * @description includes the fields we need for review
 */
export const ReviewFields: (keyof review)[] = [
	'content',
	'title',
	'book_id',
	'updated_at',
	'created_at',
	'id',
	'like_count',
	'dislike_count',
	'user_id',
	'level_of_immersion_rating',
	'plot_rating',
	'character_development_rating',
	'world_setting_rating',
	'writing_rating',
	'avatar_url',
	'username',
	'language',
	'user_modified_at',
	'statistics_modified_at'
];
/**
 * @description on client side , some of the review fields are not public
 */
export const ReviewFieldsCSV = ReviewFields.join(',') as unknown as Join<
	[
		'content',
		'title',
		'book_id',
		'updated_at',
		'created_at',
		'id',
		'like_count',
		'dislike_count',
		'user_id',
		'level_of_immersion_rating',
		'plot_rating',
		'character_development_rating',
		'world_setting_rating',
		'writing_rating',
		'avatar_url',
		'username',
		'language',
		'is_visible',
		'user_modified_at',
		'statistics_modified_at'
	],
	','
>;

export const userReviewDataFields = ['is_like', 'user_id'].join(
	','
) as 'is_like,user_id';

export const ReviewFullJoin = `${ReviewFieldsCSV},profiles!inner(${profilePublicField}),user_comment_data(${userReviewDataFields})`;
