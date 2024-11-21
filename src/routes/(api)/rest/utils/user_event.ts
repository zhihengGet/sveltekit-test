import { dev } from '$app/environment';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { book, chapter, user_events } from '$lib/types';
import { format } from 'date-fns';
import type { apiEnv } from '../[...paths]/+server';
import { KV } from './kv';

type events_type =
	| 'create_review'
	| 'create_comment'
	| 'published_chapter'
	| 'created book'
	| 'created_chapter';

interface event {
	target_id: string /* comment id, book id, chapter id */;
	target_user_id: string /* comment owner id, book author id */;
	event_type: events_type;
	link: string;
	event_body: string;
	event_title: string;
}
export type UserEvent = event;
/**
 *
 * @param props user events
 * @returns
 */
export async function push_user_event(args: {
	event: UserEvent;
	kv: KVNamespace;
	uid: string;
}) {
	const prev = (await args.kv.get(KV.USER_EVENTS(args.uid), 'json')) ?? [];
	await args.kv.put(
		KV.USER_EVENTS(args.uid),
		JSON.stringify([...prev, args.event])
	);
	console.log('write user events');
}
/**
 *
 * @param props user events
 * @returns
 */
export async function get_user_event(props: {
	user_ids: string[];
	kv: KVNamespace;
}) {
	// loop check user groups
	// or should i store it in KV ?
	let e: { [s in string]: UserEvent[] } = {};
	for (let x of props.user_ids) {
		const user_events: UserEvent[] =
			(await props.kv.get(KV.USER_EVENTS(x), 'json')) || [];
		e[x] = user_events;
	}
	if (dev) {
		return {
			'8fdab9d2-f2b1-4043-9a7b-98e1c5e171f4': [
				{
					target_id: '11',
					target_user_id: '8fdab9d2-f2b1-4043-9a7b-98e1c5e171f4',
					event_type: '',
					linkable: false,
					event_body: '1231312321',
					event_title: 'Hello'
				}
			]
		};
	}
	return e;
}
export async function save_word_count_per_day(args: {
	event: UserEvent;
	kv: KVNamespace;
	uid: string;
}) {}
const saveEventFlag = false;
export async function ChapterPubEvent({
	requestHandler,
	new_chapter,
	old_chapter
}: apiEnv['Variables'] & {
	new_chapter: chapter;
	old_chapter: Pick<chapter, 'word_count' | 'status' | 'author_id'>;
}) {
	let diff = Math.max(
		0,
		(new_chapter.word_count || 0) - (old_chapter.word_count || 0)
	);
	console.log('world count diff', diff);
	if (diff > 0) {
		const r = await requestHandler.locals.sql()`
		INSERT INTO word_count (time,user_id,"word_count")
		VALUES (${format(new Date(), 'yyy-MM-dd')},${old_chapter.author_id},${diff})
		ON CONFLICT (time,user_id)
		DO UPDATE SET word_count = word_count."word_count"+${diff};
	`;
		//requestHandler.platform.context.waitUntil(r);
		console.log('updated word count tread', r);
	}
	if (!saveEventFlag) {
		console.log('disabled create chapter event kv log');
		return;
	}
	if (new_chapter.status == 'published' && old_chapter.status != 'published')
		requestHandler.platform.context.waitUntil(
			push_user_event({
				kv: requestHandler.platform.env.kv_cache,
				uid: new_chapter.author_id,
				event: {
					event_body: 'chapter was created',
					target_id: new_chapter.id,
					target_user_id: new_chapter.author_id,
					event_title: 'Chapter Created: [' + new_chapter.title + ']',
					event_type: 'published_chapter',
					link: '/reader/' + new_chapter.book_id + '/'
				}
			})
		);
}
function generateBookEventHTML(book: book) {
	const { title, created_at: createdDate, summary, tags, category } = book;

	return `
	  <div style="font-family: Arial, sans-serif; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
		<h2>New Book Alert! 📚</h2>
		
		<p><strong>Title:</strong> <em>${title}</em></p>
		<p><strong>Created On:</strong> ${createdDate}</p>
		<p><strong>Summary:</strong> ${summary}</p>
		<p><strong>Tags:</strong> ${tags.join(', ')}</p>
		<p><strong>Category:</strong> ${category}</p>
		
		<p style="margin-top: 15px; font-style: italic; color: #555;">
		  ✨ Check out the newest release and dive into a world of ${tags[0] || category}! Authors love sharing their stories, and readers love discovering fresh finds!
		</p>
	  </div>
	`;
}

export function createBookEvent({
	requestHandler,
	book
}: apiEnv['Variables'] & { book: book }) {
	if (!saveEventFlag) {
		return console.log('disabled create book event kv log');
	}
	requestHandler.platform.context.waitUntil(
		push_user_event({
			kv: requestHandler.platform.env.kv_cache,
			uid: book.author_id,
			event: {
				event_body: generateBookEventHTML(book),
				target_id: book.id,
				target_user_id: book.author_id,
				event_title: 'Book Created: 《' + book.title + '》',
				event_type: 'created book',
				link: '/book/' + book.id
			}
		})
	);
}
