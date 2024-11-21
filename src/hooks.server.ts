import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_POSTHOG_PROJECT_ID
} from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { type Handle, error, type ResolveOptions } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { resetClient, setClient } from '$lib/supabaseClient/client';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import type { RequestInitCfProperties } from '@cloudflare/workers-types';
import { PostHog } from 'posthog-node';
import crypto from 'crypto';
/*
  When developing, this hook will add proxy objects to the `platform` object which
  will emulate any bindings defined in `wrangler.toml`.
*/

/*let platform: App.Platform;

 if (dev) {
	const { getPlatformProxy } = await import('wrangler');
	platform = await getPlatformProxy();
} */
const securityHeaders = {
	/* 	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin', */
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
	// [...]
	'X-XSS-Protection': '0',
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': dev
		? 'no-referrer-when-downgrade'
		: 'strict-origin-when-cross-origin',
	'Access-Control-Allow-Origin': dev
		? '127.0.0.1:5173'
		: 'https://www.forkread.com',
	'Access-Control-Max-Age': '86400',
	Vary: 'Origin'
};
function addSecurityHeaders(r: Response) {
	const copy = new Response(r.body, r);

	Object.entries(securityHeaders).forEach(([header, value]) =>
		copy.headers.set(header, value)
	);

	return copy;
}
// prevent supabase from warning DON'T USE GETSESSION
console.warn = () => {
	//console.log('---');
};
import { userAgentFromString } from '@edge-runtime/user-agent';
const defaultcf = {
	// Always cache this fetch regardless of content type
	// for a max of 5 seconds before revalidating the resource
	cacheTtl: 5,
	cacheEverything: true
	//Enterprise only feature, see Cache API for other plans
	//cacheKey: someCustomKey
};
export const handle: Handle = async ({ event, resolve }) => {
	//console.log('hook server test', event.platform?.context);
	//return new Response('hello world');
	/* 	if (platform) {
		event.platform = {
			...event.platform,
			...platform,
			context: platform.ctx
		};
		//@ts-expect-error
		event.request.cf = platform.cf;
	} */
	const posthog = new PostHog(PUBLIC_POSTHOG_PROJECT_ID, {
		host: 'https://us.i.posthog.com'
	});
	event.locals.posthog = posthog;
	//console.log('server hook called', event.platform?.caches.default.keys());

	//console.log('event', event.cookies.getAll());
	/* 	if (
		event.url.origin.startsWith(new URL(SITE_URL).origin) ||
		event.url.origin.startsWith('https://www.forkread.com')
	) {
		securityHeaders['Access-Control-Allow-Origin'] = event.url.origin;
	}
 	*/
	// reset client just to be safe
	//@ts-expect-error
	resetClient(null);
	event.locals.cf = null;
	// event.locals.setCfConfig = (cf?: RequestInitCfProperties) => {
	// 	event.locals.cf = cf ?? defaultcf;
	// };
	event.locals.setServerClient = ({ cf }: { cf?: RequestInitCfProperties }) => {
		event.locals.supabase = createServerClient(
			PUBLIC_SUPABASE_URL,
			PUBLIC_SUPABASE_ANON_KEY,
			{
				global: {
					fetch: (...args) => {
						if (
							args[1] &&
							event.locals.cf &&
							args[1].method?.toLocaleLowerCase() == 'get'
						) {
							console.log('should cache supabase', event.locals.cf);
							args[1].cf = event.locals.cf;
						}
						//const r = await event.fetch(...args);
						/* console.log(
							'fetch result header',
							Object.fromEntries(r.headers.entries())
						); */
						return event.fetch(...args).finally(() => {
							event.locals.cf = null; // reset it so hono does not need to
						});
					}
				},
				cookies: {
					getAll() {
						return event.cookies.getAll();
					},
					setAll(cookiesToSet) {
						/**
						 * Note: You have to add the `path` variable to the
						 * set and remove method due to sveltekit's cookie API
						 * requiring this to be set, setting the path to an empty string
						 * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
						 */
						cookiesToSet.forEach(({ name, value, options }) =>
							event.cookies.set(name, value, { ...options, path: '/' })
						);
					}
				}
			}
		);
		resetClient(event.locals.supabase); // sets global supabase client
	};
	event.locals.setServerClient({ cf: {} });
	event.locals.supabaseServer = supabaseServer();
	const userAgent = event.request.headers.get('user-agent') ?? undefined;
	const data = userAgentFromString(userAgent);
	//console.log('user agent', data);
	event.locals.userAgent = data;

	//https://www.google.com/search?q=RequestInitializerDict&oq=RequestInitializerDict&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIKCAEQABiABBiiBDIKCAIQABiABBiiBDIKCAMQABiABBiiBDIKCAQQABiABBiiBDIKCAUQABiABBiiBNIBBzM4MmowajGoAgCwAgA&sourceid=chrome&ie=UTF-8
	// workaround this bug by  remove no-store for supabase
	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};
	//use to prevent error on dev mode -> Cannot perform I/O on behalf of a different request.
	//const sql = sqlInstance();
	event.locals.session = (
		await event.locals.supabase.auth.getSession()
	)?.data?.session;
	event.locals.sql = sqlInstance;
	event.locals.profile = event.locals.session
		? (await getUserProfile({ id: event.locals.session?.user.id })).data
		: null;
	console.log(
		'hook.server session',
		event.locals.session?.user.id,
		event.url.pathname
	);
	if (event.locals.session?.user) {
		event.locals.user = event.locals.session?.user;
		event.locals.user_id = event.locals.session?.user.id;
	}
	const skipList = ['/rest/api/stats/protected/refresh'];
	if (
		event.url.pathname.indexOf('/protected') > -1 &&
		skipList.includes(event.url.pathname) === false
	) {
		const u = await event.locals.supabase.auth.getUser(
			event.locals.session?.access_token
		);
		if ((u.error || !u.data.user) && !dev) {
			console.error(u.error);
			return new Response(JSON.stringify({ message: u.error?.message }), {
				status: 401,
				headers: securityHeaders
			});
		}
		if (u.data.user) event.locals.user = u.data.user;
		// in case local session does not match
		if (!dev && u.data.user.id !== event.locals.session?.user.id) {
			event.locals.profile = event.locals.session
				? (await getUserProfile({ id: event.locals.session?.user.id })).data
				: null;
			if (!event.locals.profile) {
				return new Response(
					JSON.stringify({ message: 'Missing Profile,Please Contact support' }),
					{
						status: 401,
						headers: securityHeaders
					}
				);
			}
		}
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
		transformPageChunk
	});
	// Clean up or close the connection if needed
	/* await sql.end().catch((v) => {
		console.error('error when closing sql ', v);
	}); */

	//await sql.end();
	//console.log('event,platform', event.platform);
	//await posthog.shutdown();
	event.platform?.context.waitUntil(
		posthog.shutdown().catch((e) => console.error('hog er', e))
	);
	const copy = addSecurityHeaders(response);

	return copy;
};
export const FETCH_PROXY_SCRIPT = `
	const _fetch = window.fetch;
	window.fetchProxy = (...args) => {
		console.log('windows fetch');
		return _fetch(...args);
	};
	window.fetch = (...args) => {
		console.log('svelte wrapped fetch');
		return window.fetchProxy(...args);
	};
`;
export const transformPageChunk: NonNullable<
	ResolveOptions['transformPageChunk']
> = ({ html }) => {
	//console.log('transform page chunk');
	const content = `<head>
	<script nonce="u0UXDSOt8TKMOweDXnwtSg==">${FETCH_PROXY_SCRIPT}
	</script>
	`;
	return html.replace('<head>', content);
};
import type { HandleServerError } from '@sveltejs/kit';
import { getUserProfile } from '$lib/queries/user/user.server';
import { supabaseServer } from '$lib/supabaseClient/client.server';

export const handleError: HandleServerError = async ({
	error,
	event,
	status,
	message
}) => {
	const errorId = crypto.randomUUID();
	const posthog = new PostHog(PUBLIC_POSTHOG_PROJECT_ID, {
		host: 'https://us.i.posthog.com'
	});
	console.log('server error', error);
	event.locals.posthog = posthog;
	posthog.capture({
		distinctId: event.url.toString(),
		properties: {
			user_id: event.locals.user_id,
			error: error,
			status,
			message
		},
		event: 'server-error'
	});
	event.platform?.context?.waitUntil(event.locals.posthog?.shutdown());
	return {
		message: error?.message ?? 'Whoops! Error Occurred at the server !',
		errorId
	};
};
