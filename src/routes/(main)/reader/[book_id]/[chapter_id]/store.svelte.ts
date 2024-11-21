import type { chapter, paginateQuery, user_comment_data } from '$lib/types';
import type { comment } from '$lib/types';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { writable } from 'svelte/store';

export const initStore: paginateQuery<
	comment & { preview_session?: string },
	user_comment_data
> & {
	section_ids: SvelteSet<string>;
} = {
	filter: {
		book_id: '0',
		chapter_id: '0',
		parent_id: null,
		section_id: '',
		user_id: '',
		preview_session: '' // for preview chapter, only get draft chapter's comment
	},
	paginate: {
		//orderWith: 'created_at',
		orderWithMultiple: { created_at: { asc: false } },
		page: 1,
		size: 10,
		start: 0,
		end: 10,
		asc: false
	},
	search: {
		regex: undefined
	},
	section_ids: new SvelteSet()
};
import { cloneDeep, merge, partial } from 'lodash-es';
import type {
	options,
	readerTheme,
	theme
} from '$lib/data/filter/readerPersonalize';
import { z } from 'zod';

export const parentComment: {
	grandParent: comment | null;
	hasParent: boolean;
	enable: boolean;
	isFetching?: boolean;
} & comment = $state({
	enable: false,
	hasParent: false, // if backward pass, false if forwardpass
	fetchMoreComments: false,
	comment_id: -1,
	grandParent: null
}); // used for backward fetching, when user jump to reader page with a specific id
export const currentComment: typeof initStore = $state(cloneDeep(initStore));
export const CommentSheet = $state({ open: false });
export const commentInfo = $state({
	openCommentSheet: false,
	back: false,
	forward: false,
	isLoading: false
});
/**
 * @description store section id of this chapter, used to check if a user comment still visible or not
 */
export const chapterMetaStore: {
	section_ids: SvelteSet<string | null>;
	current_chapter: chapter | null;
	comment_count: Map<string, number>;
} = $state({
	section_ids: new SvelteSet([null]),
	current_chapter: null,
	comment_count: new SvelteMap()
});

export const updateReaderStore = (v: Partial<typeof initStore>) => {
	merge(currentComment, v);
};
// default theme
export const ReaderThemeDefault = {
	commentsOp: 1,
	skipVersions: false,
	theme: 'light',
	fontSize: '18px',
	fontFamily: 'Intel',
	/* 	lineHeight: null,
		width: null,
		backgroundColor: null, */
	scroll: false, // infinite scroll
	darken: 'invert(0)' // enable dark reader?
};
export const ReaderTheme = $state<ThemeConfig>({
	commentsOp: 1,
	skipVersions: false,
	theme: 'light',
	fontSize: '18px',
	fontFamily: 'Intel',
	/* 	lineHeight: null,
	width: null,
	backgroundColor: null, */
	scroll: false, // infinite scroll
	darken: 'invert(0)', // enable dark reader?
	backgroundColor: null,
	backgroundImage: '',
	color: null,
	commentButton: '',
	containerBackgroundColor: '',
	containerBackgroundImage: '',
	width: null
});
export const themeConfigSchema = z.object(<Partial<readerTheme>>{
	commentsOp: z.number().or(z.null()).default(0),
	skipVersions: z.boolean().default(false).nullable(),
	theme: z.string(),
	fontSize: z.string(),
	fontFamily: z.string(),
	backgroundColor: z.string().nullable(),
	backgroundImage: z.string(),
	color: z.string().nullable(),
	commentButton: z.string(),
	containerBackgroundColor: z.string(),
	containerBackgroundImage: z.string(),
	darken: z.string(),
	lineHeight: z.string().nullish(),
	scroll: z.boolean().default(true).nullable(),
	width: z.string().nullable()
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export const openRune = $state({ theme: false });
export const CommentStore = writable({
	...initStore.filter
});
export const PaginationStore = writable<paginateQuery<comment>['paginate']>({
	...initStore.paginate
});
//export const selectedComment = writable<Partial<comment>[]>([]);
export const CommentStack = $state<Partial<comment>[]>([]);
// from child to parent
export const BackwardCommentStack = $state<Partial<comment>[]>([]);

export function clearCommentStack() {
	CommentStack.splice(0, CommentStack.length);
}
export function clearBackwardCommentStore() {
	parentComment.hasParent = false;
	parentComment.id;
}
export function addCommentToStack(c: Partial<comment>) {
	CommentStack.push(c);
}
export function popStack() {
	CommentStack.pop();
}
export function resetBackward() {
	parentComment.hasParent = false;
	parentComment.id = -1;
	//backwardCommentStore.fetchMoreComments = false;
	parentComment.enable = false;
}
export function resetCommentStore() {
	Object.assign(currentComment, cloneDeep(initStore));
	clearCommentStack();
	resetBackward();
}

export function BackToParent() {
	currentComment.filter!.parent_id = parentComment.parent_id;
	// restore comment stack if last item in the stack still have parent_id (when use jump to a comment with URL)
	parentComment.id = currentComment.filter!.parent_id ?? -1;
	popStack();
}
