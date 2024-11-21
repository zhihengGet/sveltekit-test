import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { PUBLIC_POSTHOG_PROJECT_ID } from '$env/static/public';

export const loadPostHog = async () => {
	if (browser) {
		posthog.init(PUBLIC_POSTHOG_PROJECT_ID, {
			api_host: 'https://us.i.posthog.com'
		});
	}
	return;
};
