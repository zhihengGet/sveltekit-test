import type {
	chapter,
	Join,
	UnionToTuple,
	user_chapter_data
} from '$lib/types';
export type chapterFields = Join<UnionToTuple<keyof user_chapter_data>, ','>;
export const user_chapter_data_fields /* : (keyof user_chapter_data)[] */ = [
	'is_like',
	'created_at',
	'updated_at',
	'user_id',
	'chapter_id',
	'is_purchased',
	'rating',
	'stripe',
	'shelved',
	'is_bookmark',
	'bookmark_notes'
].join(',') as chapterFields;

export const ChapterFields /* : (keyof chapter)[] */ = [
	'title',
	'content', // must at this index
	'sequence',
	'book_id',
	'price',
	'character_count',
	'author_id',
	'updated_at',
	'created_at',
	'id',
	'authors_words',
	'status',
	'dislike_count',
	'like_count',
	'user_modified_at',
	'statistics_modified_at',
	'word_count'
];
export type ChapterFields = Join<
	[
		'title',
		'content', // must at this index
		'sequence',
		'book_id',
		'price',
		'character_count',
		'author_id',
		'updated_at',
		'created_at',
		'id',
		'authors_words',
		'status',
		'dislike_count',
		'like_count',
		'user_modified_at',
		'statistics_modified_at',
		'word_count'
	],
	','
>;
export type ChapterFieldsNoContent = [
	'title',
	//'content', // must at this index
	'sequence',
	'book_id',
	'price',
	'character_count',
	'author_id',
	'updated_at',
	'created_at',
	'id',
	'authors_words',
	'status',
	'dislike_count',
	'like_count',
	'user_modified_at',
	'statistics_modified_at',
	'word_count'
];
export type ChapterFieldsNoContentJoined = Join<ChapterFieldsNoContent, ','>;
export const chapterCols = ChapterFields.join(',') as ChapterFields;
export const chapterColsWithUserInfo =
	`${chapterCols},user_chapter_data(${user_chapter_data_fields})` as const;
export const chapterColsExcludeContent = ChapterFields.filter(
	(v) => v != 'content'
).join(',') as ChapterFieldsNoContentJoined;
