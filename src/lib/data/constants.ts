//import { dev } from '$app/environment';

/** @constant {megabytes} */
export const FILE_SIZE_LIMIT = 4; // 4mb because vercel 5mb body parser
/** @constant {second} */
export const USER_SESSION_LIMIT = 24 * 60 * 60; //sec
/** @constant {second} */
export const BOOK_SESSION_LIMIT = 24 * 60 * 60; // sec

export const MAX_LIKE_DISLIKE = 99999;

export const CHAPTER_TITLE_LIMIT = 100;

export const SELECTED_BOOK_KEY = 'editor_selected_book';

/**
 * @constant {milliseconds} // when should we register register click again, save it in UTC format
 */

export const ANONYMOUS_CLICK_LIMIT = 24 * 60 * 60 * 1000;

export const USER_COOKIE_NAME = 'log_auth';
// name for login csrf
export const LOGIN_CSRF = 'login_csrf';

//export const SITE_FULL_NAME = '🍀🍴ForkRead✍🍀';
export const SITE_URL =
	!import.meta.env || import.meta.env.DEV
		? 'http://127.0.0.1:5173/'
		: typeof window != 'undefined'
			? window.location.origin
			: 'https://forkread.com/';
export const SITE_SYMBOL = '🍀';
export const SITE_NAME = '🍴ForkRead✍';

// user constants
/**
 * @constant {seconds} // max age of user session cookie
 */
export const USER_COOKIE_AGE = 60 * 60 * 20;
export const MAX_LOGIN_TRIES = 5;
export const MAX_USER_SUMMARY = 1000;
export const MAX_USER_EMAIL_LENGTH = 100;
export const MAX_USERNAME_LENGTH = 20;
export const MAX_USERNAME_PASSWORD = 20;
export const MAX_USER_AVATAR_URL_LENGTH = 250;
export const MAX_BOOK_IMAGE_URL_LENGTH = 250;
export const MAX_BASKET_NAME = 40;
export const REDDIT_SUPPORT = 'https://www.reddit.com/r/forkread';

export const userLimits = {
	MAX_USERNAME_LENGTH,
	MIN_USERNAME_LENGTH: 1,
	MAX_EMAIL_LENGTH: MAX_USER_EMAIL_LENGTH,
	MAX_AVATAR_URL_LENGTH: MAX_USER_AVATAR_URL_LENGTH,
	MIN_PASSWORD_LENGTH: 10,
	MAX_PASSWORD_LENGTH: MAX_USERNAME_PASSWORD,
	MAX_USER_SUMMARY: MAX_USER_SUMMARY
};
// book
export const MAX_AUTHORS_WORDS = 500;
export const BOOK_COVER_SIZE = {
	sm: [120, 90],
	md: [120, 90],
	lg: [240, 180]
} as const;
export const MAX_BOOK_CUSTOM_TAG = 3;
export const MAX_BOOK_PRESET_TAG = 6;
export const MAX_BOOK_TAG = MAX_BOOK_CUSTOM_TAG + MAX_BOOK_PRESET_TAG;
export const BOOK_LIMITATIONS = {
	MAX_TITLE_LENGTH: 200,
	MAX_SUMMARY_LENGTH: 1000,
	MAX_IMAGE_URL_LENGTH: 250,
	MIN_TITLE_LENGTH: 1,
	MIN_SUMMARY_LENGTH: 10,
	MAX_SECRET_KEY: 20,
	MAX_AUTHORS_WORDS: MAX_AUTHORS_WORDS,
	BOOK_COVER_SIZE: BOOK_COVER_SIZE,
	MAX_TAGS: {
		MAX_PRESET_TAG: MAX_BOOK_PRESET_TAG,
		MAX_CUSTOM_TAG: MAX_BOOK_CUSTOM_TAG,
		MAX_BOOK_TAG
	}
} as const;

//@deprecated , we allow title to duplicate
export const PROHIBITED_BOOK_TITLE = ['-DELETED-', SITE_NAME];
//export const MAX_CHAPTER_CONTENT_LENGTH = 100000 / 2;

export const MAX_CHAPTER_COMMENT_LENGTH = 500;
export const MIN_CHAPTER_COMMENT_LENGTH = 10;
export const KB = 1e3;
/**
 * @description 1 mb in bytes
 */
export const MB = 1e6;
export const MAX_CHAPTER_BYTE = 5 * MB; // 50kb ? at least 6mb photo cache at KV
export const MAX_CHAPTER_STRIPED_HTML_LENGTH = 125000; // 125k characters

export const MAX_COMMENT_BYTE = 5000; // 5kb
export const chapterLimits = {
	MAX_TITLE_LENGTH: CHAPTER_TITLE_LIMIT,
	//MAX_SUMMARY_LENGTH: 1000,
	// IMAGE_URL_LENGTH: 250,
	MIN_TITLE_LENGTH: 1,
	MAX_BODY_SIZE_MEGABYTE: MAX_CHAPTER_BYTE,
	MAX_CHAPTER_CONTENT_LENGTH: MAX_CHAPTER_STRIPED_HTML_LENGTH,
	MAX_SEQUENCE: Number.MAX_SAFE_INTEGER / 2,
	MIN_SEQUENCE: Number.MIN_SAFE_INTEGER / 2
	//MIN_SUMMARY_LENGTH: 10,
} as const;
export const MAX_REVIEW_CONTENT_BYTE = 100 * 1e3; //100kb
export const MAX_REVIEW_TITLE_BYTE = 100;
export const chapterCommentLimits = {
	MAX_BODY_LENGTH: MAX_CHAPTER_COMMENT_LENGTH,
	MIN_BODY_LENGTH: MIN_CHAPTER_COMMENT_LENGTH,
	MAX_CHAPTER_BYTE,
	MAX_CHAPTER_STRIPED_HTML_LENGTH
};
export const reviewLimits = {
	MAX_BODY_LENGTH: 1e4,
	MAX_REVIEW_CONTENT_BYTE, // mb
	MIN_BODY_LENGTH: 200,
	MAX_TITLE_LENGTH: 100
} as const;

export const MAX_USER_BOOK_BASKET = 100;
export const MAX_AUTHOR_BOOK_BASKET = 20;

/**
 * @description - book cover width in px
 * */
export const BOOK_WIDTH = 150;
export const BOOK_HEIGHT = 200;

// review

export const REVIEW_RATING_MAX_VAL = 5;

export const COMMENT_IDENTIFIER = 'data-chapter-comment-id';

export const DEFAULT_FOLDER = 'default';
export const MAX_FOLDERS_SIZE = 200;

export const GET_URL = () => window.location.origin;

export const MAX_PREVIEW_DURATION = 365 * 24;
export const MAX_FILE_UPLOAD = 250;
export const artworkLimits = {
	MAX_NAME: 100,
	MAX_DESCRIPTION: 500,
	MAX_ARTWORK_PER_USER: 200
};
// notes for chapter bookmark
export const MAX_BOOKMARK_LENGTH = 150;
export const DEFAULT_REVIEW_INVITATION_RECEIVED_PER_DAY = 20;
export const MAX_INVITATION_SENT_PER_AUTHOR = 10;

export const COMMENT_EMAIL_THROTTLER = '5min' as const; // chapter level throttle
export const REVIEW_EMAIL_THROTTLER = '5min' as const; // book level
export const DUMMY_UUID = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
export const DUMMY_NULL_UUID = '00000000-0000-0000-0000-000000000000';
export const MAX_TAG_LENGTH = 20;
export const MAX_TAGS = 20;
export const MAX_NUMBER_AUTHOR_MESSAGE = 20;
export const MAX_NUMBER_OF_FOLLOWER_MESSAGE = 100;
export const MAX_NUMBER_OF_FOLLOWER_MESSAGE_PER_DAY = 10;
export const MAX_AUTHOR_BOOK_MESSAGE_SIZE = 300;
export const MAX_MESSAGE_BODY_LENGTH = 300;
export const MAX_FOLLOWED_AUTHOR = 250;

// chat
export const MAX_USER_CHAT_MESSAGE_LENGTH = 500;
export const MIN_CHAT_ROOM_NAME = 5;
export const MAX_CHAT_ROOM_NAME = 100;
export const MAX_USER_CHAT_ROOM = 2;
export const MAX_TOTAL_CHAT_ROOM = 8; // user can only join+own 8 chat room
export const MAX_USER_CHAT_ROOM_SIZE = MAX_TOTAL_CHAT_ROOM; // user can only join+own 15 chat room
export const SEC = 1000;
export const MINUTE = 60000;
export const HOUR = MINUTE * 60;
export const DAY_IN_Milliseconds = HOUR * 24;
export const CHATROOM = {
	MAX_USER_CHAT_MESSAGE_LENGTH,
	MIN_USER_CHAT_MESSAGE_LENGTH: 1,
	MIN_CHAT_ROOM_NAME,
	MAX_NUMBER_OF_USER_IN_ROOM: 10,
	MAX_CHAT_ROOM_NAME,
	MAX_USER_DESCRIPTION: 500,
	MAX_NUMBER_OF_CREATED_ROOM: 2,
	MAX_MESSAGE_IN_USER_INBOX: 10,
	MAX_RESOURCES: 100,
	MAX_JOINED_CHATROOM: 6,
	MAX_TOTAL_CHAT_ROOM,
	MAX_REASON: 100,
	MAX_MUTE_TIME: DAY_IN_Milliseconds * 30 /* 30 DAY */
};

export const WordCountHeatmapDay = 60;
export const WordCountHeatmapDayOther = 30;

/* soft limit , we don't really care, as long as it fits KV 25mb limit */
export const MaxTagOnShelvedBook = 5;

export const DEFAULT_BOOK_LANGUAGE = 'English';
export const DEFAULT_AGE_RANGE = 'all age';
export const DEFAULT_ANY_ALL_AGE_RANGE = 'all age';
