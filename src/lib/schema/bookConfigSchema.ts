import { isValid } from 'date-fns';
import { BigIntIdsZod } from './querySchema/zodPagination';
import { z } from 'zod';
function validateURL(url: string, host: string | string[]) {
	try {
		if (!url) return true;
		// Create a URL object to parse the URL
		const parsedUrl = new URL(url);

		// Extract the hostname and normalize it (remove 'www.')
		const hostname = parsedUrl.hostname.replace('www.', '');

		// Check if the hostname matches any of the official site domains
		const validHosts = [host].flat();

		// Check if the protocol is https and the domain is valid
		return parsedUrl.protocol === 'https:' && validHosts.includes(hostname);
	} catch (error) {
		// If URL parsing fails, it's an invalid URL
		return false;
	}
}
export const bookConfig = z
	.object({
		book_id: BigIntIdsZod,
		allow_copy: z.boolean(),
		allow_chapter_read_on_hide: z.boolean(),
		notifyOnFirstComment: z
			.string()
			.refine((v) => isValid(new Date(v)))
			.transform((v) => new Date(v).toISOString().split('T')[0]),
		notifyOnReview: z
			.string()
			.refine((v) => isValid(new Date(v)))
			.transform((v) => new Date(v).toISOString().split('T')[0]),
		maxReviewTradeDaily: z.number(),
		notifyOnUserCommentReply: z.boolean(),
		discontinue: z.boolean(),
		freeARCCopy: z.boolean(),
		twitter: z
			.string()
			.refine(
				(v) => validateURL(v, ['twitter.com', 'x.com']),
				'Invalid twitter url. i.e https://x.com'
			)
			.or(z.literal(''))
			.nullable(),
		facebook: z
			.string()
			.refine(
				(v) => validateURL(v, 'facebook.com'),
				'Invalid facebook url. i.e https://facebook.com'
			)
			.nullable(),
		patreon: z
			.string()
			.refine(
				(v) => validateURL(v, 'patreon.com'),
				'Invalid patreon url. i.e https://patreon.com'
			)
			.nullable(),
		reddit: z
			.string()
			.refine(
				(v) => validateURL(v, 'reddit.com'),
				'Invalid reddit url. i.e https://reddit.com'
			)
			.nullable(),
		discord: z
			.string()
			.refine(
				(v) => validateURL(v, 'discord.com'),
				'Invalid discord url. i.e https://discord.com'
			)
			.nullable()
	})
	.partial();

export type bookConfig = z.infer<typeof bookConfig>;
