import { addMilliseconds, isAfter, isBefore } from 'date-fns';
import { getBookConfig } from '../bookApp.server';
import { sendNotifyOnReviewEmail } from '../sendEmail.server';
import type {
	counter,
	globalThrottleInterval
} from '../../../../../../../packages/durable-objects/src';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';

import { REVIEW_EMAIL_THROTTLER, SITE_URL } from '$lib/data/constants';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import type { comment } from '$lib/types';
import { DO_GEN } from './kv';

export async function throttler(props: {
	name: string;
	gap: keyof typeof globalThrottleInterval;
	platform: App.Platform;
	reason: string;
}) {
	try {
		let id = props.platform.env.do_throttler.idFromName(props.name);
		let stub = props.platform?.env.do_throttler.get(id);
		if (!stub.name) return true;
		const mem_updated_at = await stub
			?.fetch('https://www.' + props.reason + '.com')
			.catch((e) => console.error('throttle', e));
		if (!mem_updated_at) return console.error('missing stub for throttle api');
		console.log('do fetch status', mem_updated_at.statusText);
		if (mem_updated_at?.status !== 200 || !mem_updated_at) {
			console.error('failed to fetch throttler', mem_updated_at?.statusText);
			return false;
		}
		const body = (await mem_updated_at.json()) as typeof globalThrottleInterval;
		console.log('checking throttler', props.reason, body);
		const [diff, last_date] = body[props.gap];
		const shouldUpdateBook = isAfter(
			Date.now(),
			addMilliseconds(last_date, diff) //  24hr <= Date.now - updated_at4
		);
		return shouldUpdateBook;
	} catch (e) {
		console.error('error in global throttler', e);
	}
	return false;
}
export async function throttlerRPC(props: {
	name: string;
	platform: App.Platform;
	reason: string;
}) {
	try {
		let id = props.platform.env.do_throttler.idFromName(props.name);
		let stub: counter = props.platform?.env.do_throttler.get(id);
		return stub;
	} catch (e) {
		console.error('error in global rpc throttler', e);
	}
	return null;
}

export async function notifyAuthorOnReview({
	do_name,
	platform,
	user_id,
	book_id,
	review_id
}: {
	do_name: string;
	platform: App.Platform;
	user_id: string;
	book_id: number;
	review_id?: string;
}) {
	const config = await getBookConfig(platform, book_id);
	if (isBefore(new Date(), config.notifyOnReview ?? new Date('1990/1/1'))) {
		const shouldUpdateBook = await throttler({
			name: do_name,
			gap: REVIEW_EMAIL_THROTTLER,
			platform: platform,
			reason: 'review-email-event'
		});
		if (!shouldUpdateBook)
			return console.log('Only email author every ' + REVIEW_EMAIL_THROTTLER);

		const author_email = await sqlInstance()`
            select title,books.created_at,email,is_visible
            from books
            inner join auth.users on auth.users.id=books.author_id
            where books.id=${book_id}
        `;
		const book = author_email?.[0];
		if (
			book.is_visible !== false &&
			book &&
			book.title &&
			!isAfter(new Date(), config.notifyOnReview ?? new Date('1999')) // 1 year range
		) {
			console.log('send revie email to author');
			await sendNotifyOnReviewEmail({
				to: book!.email,
				html: `A reader just wrote a review for your book *${book.title}* <a href="${SITE_URL}/book/${book_id}?review_id=${review_id}">Click here to read </a>; To stop receiving emails, disable it through book settings🚧`
			});
		}
	} else {
		console.log('skip notify author', config.notifyOnReview);
	}
}
export async function notifyCommenter(temp: {
	do_name: string;
	platform: App.Platform;
	user_id: string;
	book_id: number;
	comment: comment;
}) {
	const config = await getBookConfig(temp.platform, temp.book_id);
	let author_book = await sqlInstance()`
	select title,books.created_at,email,author_id
	from books
	inner join auth.users on auth.users.id=books.author_id
	where books.id=${temp.book_id}`;
	console.log('book author ', author_book);
	let is_allowed = false;
	let book_author_info = author_book[0];
	if (!book_author_info) {
		return console.log('Failed to fetch author info for this comment');
	}
	const info = temp.comment;
	const parent_comment = info?.parent_id
		? await supabaseServer()
				.from('comments')
				.select('user_id')
				.eq('id', info.parent_id)
				.single()
		: null;

	if (info!.parent_id !== null) {
		if (config.notifyOnUserCommentReply) {
			if (parent_comment?.data?.user_id === author_book?.[0]?.author_id) {
				// THE COMMENT replied to is the comment written by author
				is_allowed = true; //TODO throttle?
			}
		}
		return console.log('not top level comment & disabled notification');
	}
	if (
		book_author_info.author_id === info.user_id &&
		info.parent_id !== null &&
		parent_comment?.data?.user_id !== info.user_id
	) {
		// author is replying to antoher person
		// no throttler bc only one person (author)
		await sendNotifyOnReviewEmail({
			to: author_book[0]!.email,
			subject: 'Authore replied to your comment ' + book_author_info.title,
			html: `Author of the book *${book_author_info.title}* replied to your comment.	<a
				href="/reader/${temp.book_id}/${info?.chapter_id}?section=${encodeURI(
					info.section_id
				)}&parent=${0}&comment_id=${info?.id}"
		target="_blank"
			>
		Click here to view comment
			</a>; To stop receiving emails, disable it through book settings🚧`
		});
	}
	// notify author about replies or first level comments
	// throttle bc multiple user can try to notify
	if (is_allowed && isBefore(new Date(), config.notifyOnReview)) {
		const shouldUpdateBook = await throttler({
			name: DO_GEN.EVENT_COMMENT_THROTTLER_NAME(info.chapter_id),
			gap: '5min',
			platform: temp.platform,
			reason: 'comment_email_event'
		});
		if (!shouldUpdateBook)
			return console.log('Only email author every 5 hour about new reviews');

		const author_email =
			author_book ??
			(await sqlInstance()`
			select title,books.created_at,email
			from books
			inner join auth.users on auth.users.id=books.author_id
			where books.id=${temp.book_id}
		`);
		const book = author_email?.[0];
		if (
			book &&
			book.title &&
			!isAfter(new Date(), config.notifyOnReview ?? new Date('1999')) // 1 year range
		) {
			await sendNotifyOnReviewEmail({
				to: book!.email,
				html: `A beta reader just wrote a comment for your book *${book.title}* 	<a
			href="/reader/${temp.book_id}/${info?.chapter_id}?section=${encodeURI(
				info.section_id
			)}&parent=${0}&comment_id=${info?.id}"
			target="_blank"
		>
			Click here to view comment
		</a>; To stop receiving emails, disable it through book settings🚧`
			});
		}
	}
}
