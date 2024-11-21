// src/routes/+layout.ts
import { cssControl } from '$lib/state/css.svelte';
import { setUserProfile, user } from '$lib/state/runes.svelte';
import { setClient } from '$lib/supabaseClient/client';
import { loadPostHog } from '$lib/utils/posthog';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { browser, dev } from '$app/environment';
// should be called on client only ?
// this function ill run twice, one on server and one on client
export const load = (async ({ fetch, data, depends, url }) => {
	//console.log('calling layout.ts');
	depends('supabase:auth');
	/*
	//FIXME do this at page rule level
	if (url.origin.includes('www') && !dev) {
		url.hostname = 'forkread.com';
		redirect(301, url);
	}*/
	if (browser && !import.meta.env.DEV) {
		console.log = () => {
			//console.warn('client log disabled');
		};
	}
	//session is passed from layout.server.ts
	const supabase = setClient({
		data: { fetch, session: data?.session, cookies: data.cookies }
	});
	cssControl.mobile = data.isMobile; // initialize ssr
	const {
		data: { session }
	} = await supabase.auth.getSession();
	if (session) {
		//	authStatus.set('signed in');
		user.authStatus = 'signed in';
	}
	const profile = data.profile;

	if (profile) {
		setUserProfile(profile);
	}
	if (import.meta.env.PROD) loadPostHog();
	console.log('🚀 ~ root layout.ts ', profile);
	return { supabase, session, profile, isMobile: data.isMobile };
}) satisfies LayoutLoad;
