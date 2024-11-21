import url from 'url';
import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { json } from 'stream/consumers';
import { SITE_URL } from '$lib/data/constants';
import { CustomError } from '$lib/queries/base/errors';
import { supabaseServer } from '$lib/supabaseClient/client.server';

const CLIENT_ID = 'pppp';
const CLIENT_SECRET =
	'Inu82vnP8T-_g5B5p21aaqPYrB-P1JZr_ENFyYtsW19nxvfGQwe_TV9xo09YhZhY';

const redirectURL = 'http://mypatreonapp.com/oauth/redirect';
const protectedApp = new Hono()
	.get('/link/patreon', async ({ json, redirect, var: { requestHandler } }) => {
		const uid = requestHandler.locals.user.id;
		const url = new URL('www.patreon.com/oauth2/authorize');
		const redirectURL =
			SITE_URL + 'rest/api/externalOauth/protected/redirect/patreon/' + uid;
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('client_id', CLIENT_ID);
		url.searchParams.set('redirect_uri', redirectURL);
		const test = `www.patreon.com/oauth2/authorize
                        ?response_type=code
                        &client_id=${CLIENT_ID}
                        &redirect_uri=${redirectURL}
                       `;
		console.log('login url', test);
		// url.searchParams.set('scope', 'code');
		// url.searchParams.set('state', 'code');
		return redirect(test);
	})

	.get(
		'/unlink',
		zValidator(
			'query',
			z.object({ type: z.enum(['patreon', 'buymeacoffee']) })
		),
		async ({ req, json, var: { requestHandler } }) => {
			const uid = requestHandler.locals.user_id;
			const oauthGrantCode = req.valid('query');
			const data1 = await supabaseServer()
				.from('external_profile')
				.delete()
				.eq('user_id', uid)
				.maybeSingle();
			if (data1.error) {
				throw new CustomError(
					'Failed to unlink patreon, please try again ! ' + data1.error.message
				);
			}
			return json(data1);
		}
	)
	.get('/link/buymeacoffe', z.object({ code: z.string(), state: z.string() }));

const public_route = new Hono().get(
	'/redirect/patreon/:uid',
	zValidator('query', z.object({ code: z.string(), state: z.string() })),
	zValidator('param', z.object({ uid: z.string().uuid() })),
	async ({ req, json, var: { requestHandler } }) => {
		const oauthGrantCode = req.valid('query');
		const user_id = req.valid('param');
		type res = {
			access_token: string;
			refresh_token: string;
			expires_in: string;
			scope: string;
			token_type: 'Bearer';
		};

		const r = await fetch('www.patreon.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		});

		const patreonAPIClient: res = await r.json();
		console.log('getting access token', r);

		// store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
		// You can also ask for result.rawJson if you'd like to work with unparsed data
		const data = store.findAll('user').map((user) => user.serialize());
		// mark this user as verified
		const test = data as PatreonUser;
		if (
			test.data.attributes.is_deleted ||
			test.data.attributes.is_email_verified
		) {
			throw new CustomError(
				'Your patreon account was deleted or not verified !'
			);
		}
		const patreon_id = {
			patreon_link: test.links.self,
			id: test.data.id
		};
		// check if this is already linked with someone
		const exists = await supabaseServer()
			.from('external_profile')
			.select('*')
			.eq('type', 'patreon')
			.eq('is_linked', true)
			.select('*');
		// save to our database

		const data1 = await supabaseServer()
			.from('external_profile')
			.insert({
				user_id: user_id,
				cred: JSON.stringify(patreon_id),
				is_linked: true,
				type: 'patreon'
			})
			.select('*');
		if (data1.error) {
			throw new CustomError(
				'Failed to save the link, please try again ! ' + data1.error.message
			);
		}
		return data1;
	}
);
export const externalAuthApp = new Hono<apiEnv>()
	.route('/protected', protectedApp)
	.route('/public', public_route)
	.onError((err, c) => {
		console.log('catching error in bookApp', err);
		return c.json({ message: err.message }, 400);
	});

export interface PatreonUser {
	data: Data;
	links: Links;
}

export interface Data {
	attributes: Attributes;
	id: string;
	relationships: Relationships;
	type: string;
}

export interface Attributes {
	about: any;
	created: string;
	discord_id: any;
	email: string;
	facebook: any;
	facebook_id: any;
	first_name: string;
	full_name: string;
	gender: number;
	has_password: boolean;
	image_url: string;
	is_deleted: boolean;
	is_email_verified: boolean;
	is_nuked: boolean;
	is_suspended: boolean;
	last_name: string;
	social_connections: SocialConnections;
	thumb_url: string;
	twitch: any;
	twitter: any;
	url: string;
	vanity: string;
	youtube: any;
}

export interface SocialConnections {
	deviantart: any;
	discord: any;
	facebook: any;
	reddit: any;
	spotify: any;
	twitch: any;
	twitter: any;
	youtube: any;
}

export interface Relationships {
	pledges: Pledges;
}

export interface Pledges {
	data: any[];
}

export interface Links {
	self: string;
}
