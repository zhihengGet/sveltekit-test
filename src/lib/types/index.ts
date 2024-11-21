export type { AuthResponse, User } from '@supabase/supabase-js';
export * from './pagination';
export type { signIn, signUp } from './signin';
import type { categoryValueTypes, leadType } from '$lib/data/filter';
import type { SelectedBook } from '$lib/queries';
//export * from '$lib/queries';

import type { ChapterFieldsNoContent } from '$lib/queries/chapter/fields';
import type { Database as db } from './database.types';
import type { ReplaceType, Replace } from './util';
import { chapter_status } from '../data/dbConstants';
import { chat_roles, chatUserStatus } from '$lib/schema/chatSchema';
type _db = ReplaceType<
	db,
	['public', 'Tables', 'chapters', 'Row', 'status'],
	(typeof chapter_status)[number]
>;
// add leads
type _db_1 = ReplaceType<
	_db,
	['public', 'Tables', 'books', 'Row', 'lead'],
	leadType
>;
// add leads
type _db_2 = ReplaceType<
	_db_1,
	['public', 'Tables', 'books', 'Row', 'category'],
	categoryValueTypes
>;

export type _db_3 = ReplaceType<
	_db_2,
	['public', 'Tables', 'reviews', 'Row', 'type'],
	review_type
>;
export type _db_4 = ReplaceType<
	_db_3,
	['public', 'Tables', 'comments', 'Row', 'type'],
	comment_type
>;
export type _db_5 = ReplaceType<
	_db_3,
	['public', 'Tables', 'user_chatroom_data', 'Row', 'role'],
	'user' | 'admin' | 'moderator'
>;
export type Database = _db_5;

type definitions = Database['public']['Tables'];
export type table = definitions;
export type full_profile = definitions['profiles']['Row'];
export type profile = Omit<full_profile, 'extra'>;

// user data for another user
export type user_profile_data = definitions['user_profile_data']['Row'];
export type profileWithUserData = profile & {
	user_profile_data: user_profile_data;
};
export type table_names = keyof definitions;

export type full_book = Omit<definitions['books']['Row'], 'age_rage'> & {
	age_range: string;
};

export type book = SelectedBook;
/**
 * @description when we join(inner join) the book table with user_data table
 */
export type bookWithUserInfo = SelectedBook & {
	user_book_data?: [user_book_data];
};
type book_status = 'completed' | 'archived' | 'ongoing' | 'draft';
type comment_type =
	| 'suggestion'
	| 'grammar'
	| 'typo'
	| 'plot'
	| null
	| undefined;
type review_type =
	| 'beta_review'
	| 'regular'
	| 'traded_review'
	| null
	| undefined;

export type chapter = definitions['chapters']['Row'];
export type chapterWithUserInfo = chapter & {
	user_chapter_data: [user_chapter_data];
};
export type min_chapter = Pick<chapter, ChapterFieldsNoContent[number]>; //no content
export type review = definitions['reviews']['Row'];

//export type countries = definitions["countries"];
//export type books_auth = definitions['books_auth']['Row'];
export type author_book_buckets = definitions['author_book_buckets']['Row'];
export type user_shelf_buckets = definitions['user_shelf_settings']['Row'];
export type folder_table = author_book_buckets | user_shelf_buckets;
export type user_review_data = definitions['user_review_data']['Row'];
export type reviewWithUserInfo = review & {
	user_review_data?: [user_review_data];
	books?: Partial<book> | null;
};

export type user_comment_data = definitions['user_comment_data']['Row'];
export type user_chapter_data = definitions['user_chapter_data']['Row'];
export type user_book_data = definitions['user_book_data']['Row'];
export type comment = definitions['comments']['Row'];
export type commentJoined = comment & {
	user_comment_data?: [user_comment_data] | user_comment_data[];
	books?: Partial<book> | null;
};
export type user_editor_setting = definitions['user_editor_settings']['Row'];
export type user_reader_setting = definitions['user_reader_settings']['Row'];
export type user_artwork_data = definitions['user_artwork_data']['Row'];
export type book_stats = {
	book_id: number;
	author_id: string;
	views: { [s in string]: number };
	referrer: { [s in string]: number };
	geo: { [s in string]: number };
};
// editor setting
type editor_setting_temp = user_editor_setting;

type editor_setting_t = {
	wordBank: { keyword: string; definition: string }[];
	style?: { backgroundColor: string; backgroundImage: string }; //not now
};

export type editor_setting = Replace<
	editor_setting_temp,
	'setting',
	editor_setting_t
>;
export type artwork = definitions['artworks']['Row']; //& { url?: string };
export type previews = Omit<definitions['previews']['Row'], 'type'> & {
	type: 'book' | 'chapter';
}; //& { url?: string };
export type artworkWithBook = definitions['artworks']['Row'] & {
	books: Partial<book>;
	user_artwork_data: [] | [user_artwork_data];
}; //& { url?: string };
export * from './util';
export type user_global_configs = definitions['user_global_configs']['Row'];
//export type trade_reviews = definitions['trade_reviews']['Row'];
export type ID = string;
export type chatrooms = definitions['chatrooms']['Row'];
export type user_events = definitions['user_events']['Row'];
export type user_chatroom_data = definitions['user_chatroom_data']['Row'] & {
	role: chat_roles;
	status: (typeof chatUserStatus)[number];
};
