import type { artwork } from '$lib/types';
import { bookCols, user_book_data_fields } from '../book';

const fields: (keyof artwork)[] = [
	'artwork_id',
	'book_id',
	'chapter_id',
	'name',
	'id'
];

const bookFields = `id,title,cover_url,author_id`;
export const artworkColsJoinedBook = `endorsed,artwork_id,book_id,chapter_id,name,created_at,updated_at,id,user_id,ai,like_count,description,dislike_count,user_modified_at,url, books!inner(${bookFields}), user_artwork_data(is_like,user_id,created_at)`;
