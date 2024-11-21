import type { Session } from '@supabase/supabase-js';
import type { PlatformProxy } from 'wrangler';
import type { Env } from '../worker-configuration';

export function pageCacheHandler(request: Request, response: Response) {
	const cp = response.clone();
}
type param = Parameters<typeof fetch>;
export async function fetchCacheHandler({
	args,
	session,
	user_id,
	platform
}: {
	args: param;
	session: Session;
	user_id: string;
	platform: PlatformProxy<Env>;
}) {
	const [url, params] = args;
	const param =
		typeof url === 'string'
			? new URL(url)
			: url instanceof Request
				? new URL(url.url)
				: url;
	if (params?.method?.toLowerCase() === 'get') {
		if (
			param.searchParams.get('user_id') !== user_id &&
			param.searchParams.get('id') !== user_id
		) {
			// cache non-user resource
			const key = param.toJSON();
			const cache = await platform.caches.default.match(key);
		}
	}

	return fetch(...args);
}
