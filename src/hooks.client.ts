import type { HandleClientError } from '@sveltejs/kit';

// import * as Sentry from '@sentry/sveltekit';
// import { browser, dev } from '$app/environment';

// if (browser && !dev) {
// 	Sentry.init({
// 		dsn: 'https://55f7079c88fc022055a0de132089b11d@o4506866156371968.ingest.us.sentry.io/4506867286278154',

// 		// We recommend adjusting this value in production, or using tracesSampler
// 		// for finer control
// 		tracesSampleRate: 1.0,

// 		// Optional: Initialize Session Replay:
// 		integrations: [Sentry.replayIntegration()],
// 		replaysSessionSampleRate: 0.1,
// 		replaysOnErrorSampleRate: 1.0
// 	});
// }
export const myErrorHandler = (async ({ error, event }) => {
	//const errorId = crypto.randomUUID();

	console.error(error, event);

	return {
		message: 'Whoops! ' + (error?.message ?? 'Unknown Error Occurred!')
	};
}) satisfies HandleClientError;

export const handleError = myErrorHandler;
