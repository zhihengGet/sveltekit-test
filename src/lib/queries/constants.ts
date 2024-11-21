import type {
	ID,
	Join,
	artwork,
	book,
	chapter,
	chatrooms,
	comment,
	paginateQuery,
	paginateTypes,
	review,
	table_names,
	user_book_data,
	user_review_data
} from '$lib/types';

import { loginError } from './base/errors';
import type { authorGet } from './book';
import type { getUserComment } from './comment/getChapterComment.svelte';

const trending_books = 'trending_books';

export { trending_books };

export const TABLES /* : { [s in table_names]: s } */ = {
	user_review_data: 'user_review_data',
	user_comment_data: 'user_comment_data',
	books: 'books',
	chapters: 'chapters',
	author_book_buckets: 'author_book_buckets',
	book_referrer: 'book_referrer',
	books_auth: 'books_auth',
	comments: 'comments',
	profiles: 'profiles',
	reviews: 'reviews',
	settings: 'settings',
	transactions: 'transactions',
	user_book_data: 'user_book_data',
	user_chapter_data: 'user_chapter_data',
	user_editor_settings: 'user_editor_settings',
	user_reader_settings: 'user_reader_settings',
	user_shelf_settings: 'user_shelf_settings',
	book_clicks: 'book_clicks',
	artworks: 'artworks'
} as const;

function key_factory<T>(props: string[]) {
	return (arg: T) => {
		return arg ? [...props, arg] : [...props];
	};
}
type args<T extends table_names> = {
	isList: boolean;
	isSelf: boolean;
	withUserData: boolean;
	paginate: paginateQuery<T>;
};

/**
 * @queryKey they all return  an array [key:string, otherData] you can use arr[0] to do general operation
 * @property {string}  getChapters               - query key for  multiple books , for public and private, general
 * @property {string}  getSpecificChapters       - get one specific chapter
 * @property {string}  getParticularReview       - get one review for user .
 * @property {string}  getReviews                - get all review for a book.
 */
export const queryKey = {
	getBooks: (props: paginateQuery<book>) => [
		'book',
		'list',
		'pagination',
		props
	],
	getBook: (props: number) => ['book', props],
	getBooksCount: (props: paginateQuery<book>) => [
		'count',
		...queryKey.getBooks(props)
	],
	getChapters: (props?: paginateQuery<chapter>) => ['chapter', 'list', props],
	getAllChapters: (props?: { id: ID }) => [
		'chapter',
		'list',
		'user owned chapters',
		props
	],
	getRecentCreatedChapters: (props?: { id: ID }) => [
		'chapter',
		'list',
		'recent'
	],
	getPublicChapters: (bookID: ID | Partial<book>) => [
		'chapter',
		'public',
		'list',
		bookID
	],
	getLastChapter: (any: { book_id: string }) => ['chapter', any],
	getSpecificChapter: (chapterID?: number) => ['chapter', chapterID],
	getSimilarBooks: (bookID: number) => ['book', 'similar', bookID],
	getUserReview: (bid: number) => ['review', 'self', 'user_review_data', bid],
	getReview: (bid: number) => ['review', 'user_review_data', bid],
	getReviews: (props: paginateQuery<review>) =>
		props
			? ['review', 'list', 'user_review_data', props]
			: ['review', 'list', 'user_review_data'],
	getUserReviews: (props?: {
		filter: unknown;
		paginate: paginateTypes<review>;
	}) => ['review', 'self', 'user', 'user_review_data', 'list', props],
	getUserReviewCount: () => ['get user review count'],
	getAuthoredBooks: (props?: authorGet) =>
		props
			? ['authored', 'user_book_data', 'book', 'self', 'list', props]
			: ['authored', 'user_book_data', 'book', 'self', 'list'],
	getAllAuthoredBooks: () => [
		'authored',
		'user_book_data',
		'book',
		'self',
		'list',
		'all'
	],
	getUserShelvedBook: (props?: paginateQuery<book, user_book_data>) => [
		'shelf',
		'book',
		'self',
		'user_book_data',
		props
	],
	getShelvedBookAll: () => ['shelf', 'book', 'self', 'user_book_data', 'all'],
	getUserShelvedBookCount: (props?: paginateQuery<book, user_book_data>) =>
		props
			? ['shelf', 'book', 'user_book_data', 'count', props]
			: ['shelf', 'book', 'user_book_data', 'count'],
	// user data about an entity e.g review
	getUserReviewData: (reviewID: user_review_data['review_id']) => [
		'getUserReviewData',
		reviewID
	],
	getUserBookData: (bookID: ID) => ['user_book_data', bookID],
	getUserShelvedBookDatas: () => ['shelf', 'user_book_data'],

	// get comment
	getComments: (props: paginateQuery<comment>) => [
		'comment',
		'user_comment_data',
		'list',
		'getComments',
		props
	],
	getComment: (props: Partial<comment>) => {
		return ['comment', 'user_comment_data', 'getComments', props];
	},
	getUserCommentData: (comment_id: number) => [
		'user_comment_data',
		'self',
		comment_id
	],
	getUserComments: (props: paginateQuery<comment>) => [
		'comments',
		'user_comment_data',
		'self',
		props
	],
	unReadCommentCount: () => ['comments', 'unread', 'count'],
	getUserChapterData: (chapter: number) => ['user_chapter_data', chapter],
	getUserComment: (props: getUserComment) => [
		'comment',
		'user_comment_data',
		'self',
		props
	],
	getUserCommentsCount: (user_id?: string) => [
		user_id,
		'get User Comment count'
	],
	getEditSetting: (s: { bookID: number }) => ['getEditSetting', s],
	getAuthorFolders: () => ['get author folders'],
	getShelfFolders: () => ['get shelf folders'],

	// ARKWORK
	getArtwork: (props?: paginateQuery<artwork>) => {
		return props ? ['artworks', 'list', props] : ['artworks', 'list'];
	},
	// chatrooms
	getPublicChatroom: (props?: paginateQuery<chatrooms>) => {
		return props ? ['chatroom', 'list', props] : ['chatroom', 'list'];
	}
};
// everything is a pagination with one page one item:)

export function queryKeyGen<s extends table_names>(
	props: paginateQuery<s>,
	desc: {
		text: string;
		isList: boolean;
		isSelf: boolean;
		tables: table_names[];
	}
) {
	const temp = [desc.text, ...desc.tables, props];
	if (desc.isList) {
		temp.splice(1, 0, 'list');
	}
	return temp;
}
/**
 * @description errors for queries
 */
export const queryErrors = {
	authCheckFailed: loginError
} as const;

export * from './storage/constants';
