/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Join, comment, user_comment_data } from '$lib/types';

// get single chapter
const allFields: (keyof comment)[] = [
	'id',
	'chapter_id',
	'created_at',
	'updated_at',
	'user_id',
	'content',
	'avatar_url',
	'username',
	'dislike_count',
	'like_count',
	'section_id',
	'parent_id',
	'book_id',
	'is_visible',
	'language',
	'has_unread_child',
	'user_modified_at',
	'statistics_modified_at',
	'tags'
];
export type fields = Join<
	[
		'id',
		'chapter_id',
		'created_at',
		'updated_at',
		'user_id',
		'content',
		'avatar_url',
		'username',
		'dislike_count',
		'like_count',
		'section_id',
		'parent_id',
		'book_id',
		'is_visible',
		'language',
		'has_unread_child',
		'user_modified_at',
		'statistics_modified_at',
		'tags'
	],
	','
>;
export const fieldFn: (exclude: (keyof comment)[]) => fields = (t) =>
	//@ts-expect-error
	allFields.filter((v) => t.indexOf(v) == -1).join(',');
export const fields = allFields.join(',') as fields;
export const user_comment_data_fields =
	'is_like,comment_id,user_id,created_at,updated_at';
export const comment_field = fields;
export const comment_with_user =
	`${comment_field},user_comment_data(${user_comment_data_fields})` as const;
