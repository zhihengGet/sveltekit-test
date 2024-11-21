/* eslint-disable @typescript-eslint/no-explicit-any */
import type { full_book, user_book_data } from '$lib/types';
import type { UnionToTuple } from '$lib/types/util';
type Join<
	T extends any[],
	U extends string | number,
	Result extends string = ''
> = T extends [infer Head extends string | number, ...infer Tail]
	? Join<Tail, U, `${Result}${Result extends '' ? '' : U}${Head}`>
	: Result;

export type SelectedBook = Pick<full_book, (typeof bookSelectFields)[number]>;

export const bookSelectFields /* : (keyof full_book)[] */ = [
	'review_count',
	'title',
	'summary',
	'character_count',
	'category',
	'tags',
	'total_click',
	'cover_url',
	'dislike_count',
	'like_count',
	'id',
	'price',
	'chapter_count',
	'lead',
	'sell_type',
	'updated_at',
	'created_at',
	'total_click',
	'status',
	'level_of_immersion_rating',
	'recommendation_count',
	'language',
	'plot_rating',
	'writing_rating',
	'world_setting_rating',
	'character_development_rating',
	'average_rating',
	'author_name',
	'author_id',
	'shelved_count',
	'authors_words',
	'is_visible',
	'is_crawled',
	'user_modified_at',
	'statistics_modified_at',
	'extra',
	'word_count',
	'display_name',
	'maturity_levels',
	'is_public_domain',
	'audience'
] as const;
export const bookCols = bookSelectFields.join(',') as Join<
	UnionToTuple<(typeof bookSelectFields)[number]>,
	','
>;
export const dayClick = `day_click,total_click`;
export type BookUpdateFieldsType = Pick<
	full_book,
	| 'category'
	| 'tags'
	| 'title'
	| 'summary'
	| 'language'
	| 'lead'
	| 'cover_url'
	| 'sell_type'
	| 'price'
	| 'status'
	| 'chapter_count'
	| 'author_name'
	| 'author_id'
	| 'authors_words'
	| 'display_name'
	| 'user_modified_at'
	| 'age_range'
	| 'maturity_levels'
	| 'is_visible'
>;
export const bookUpdateFields: (keyof BookUpdateFieldsType)[] = [
	'title',
	'summary',
	// "character_count",
	'category',
	'tags',
	// "total_click",
	'cover_url',
	// "dislike_count",
	// "like_count",
	//"id",
	'price',
	'chapter_count',
	'lead',
	'sell_type',
	//"updated_at",
	// "created_at",
	// "total_click",
	'status',
	// "level_of_immersion_rating",
	//  "recommendation_count",
	'language',
	'author_name',
	'author_id',
	'authors_words',
	'display_name',
	'user_modified_at',
	'age_range',
	'maturity_levels',
	'is_visible'
	//"plot_rating",
	// "writing_rating",
	//  "world_setting_rating",
	// "character_development_rating",
	//  "average_rating",
];
export type UserBookInfo = Join<UnionToTuple<keyof user_book_data>, ','>;
export const user_book_data_fields /* : (keyof user_book_data)[] */ = [
	'is_shelved',
	'last_chapter_read',
	'created_at',
	'book_id',
	'user_id',
	'folder', // user folder
	'author_folder', // for author,
	'accepted_reader',
	'is_beta_reader',
	'tags'
].join(',') as any as UserBookInfo;

/* export const createBookFields = [
	'category',
	'tags',
	'language',
	'price',
	'title',
	'summary',
	'authors_words',
	'status',
	'cover_url',
	'maturity_levels'
] as const;
export type createBookFieldsType = (typeof createBookFields)[number];
 */
