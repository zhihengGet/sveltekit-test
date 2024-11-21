/// all the constants related to database

import type { book } from '$lib/types';
import { invert } from 'lodash-es';

export const TABLES = {
	books: 'books',
	profiles: 'profiles',
	reviews: 'reviews',
	comments: 'comments',
	chapters: 'chapters'
};
export const FUNCTIONS = {
	create_book: 'create_book',
	update_book: 'update_book'
};
export const chapter_status = [
	'draft',
	'review',
	'under revision',
	'published',
	'scheduled',
	'trashed',
	'archived'
] as const;

// remove past tense
export const chapter_action = [
	'draft',
	'publish',
	'trash',
	'review',
	'revision',
	'archive',
	'schedule'
] as const;

export { actionToStatus };
export type chapter_status = (typeof chapter_status)[number];

export type actionTypes = (typeof chapter_action)[number];
export const ActionToIcon: { [k in actionTypes & chapter_status]: string } = {
	draft: '🗒️',
	publish: '📝',
	published: '📝',
	trash: '🗑️',
	review: '👁️ ',
	delete: '❌',
	revision: '🔄',
	scheduled: '🗓️'
};
//@ts-expect-error
export const ValidActions: {
	[k in chapter_status]: { action: actionTypes; status: chapter_status }[];
} = {};

export const statusToActions: { [k in chapter_status]: actionTypes } = {
	draft: 'draft',
	published: 'publish',
	trashed: 'trash',
	'under revision': 'revision',
	review: 'review',
	archived: 'archive',
	scheduled: 'schedule'
} as const;

for (let x of chapter_status) {
	ValidActions[x] = chapter_status
		.filter((y) => y != x)
		.map((v) => ({ action: statusToActions[v], status: x }));
}
//@ts-expect-error
const actionToStatus: { [k in actionTypes]: chapter_status } =
	invert(statusToActions);

export const book_status: book['status'][] = [
	'archived',
	'completed',
	'draft',
	'ongoing'
];
const chapter = [
	{
		status: 'Draft',
		description: "The chapter is still being written and hasn't been finalized."
	},
	{
		status: 'In Review',
		description:
			'The chapter is being reviewed for potential edits or approval before publishing.'
	},
	{
		status: 'Under Revision',
		description: 'After review, the chapter is being edited or updated.'
	},
	{
		status: 'Scheduled',
		description:
			'The chapter is complete and set to be published at a future date.'
	},
	{
		status: 'Published',
		description: 'The chapter is live and available for readers to access.'
	},
	{
		status: 'Unpublished',
		description:
			'The chapter was published but has been temporarily removed from public view, often for corrections.'
	},
	{
		status: 'Archived',
		description:
			"The chapter is no longer publicly available, but it's stored for future reference or republication."
	},
	{
		status: 'Trashed',
		description:
			'The chapter has been marked for deletion but can still be recovered if needed.'
	}
];
