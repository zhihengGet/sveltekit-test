// src/routes/[...slugs]/+server.ts
import type { RequestHandler } from './$types';

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { booksApp } from '../bookApp.server';
import { commentApp } from '../commentApp.server';
import { artworkApp } from '../artworkApp.server';
import { betaReaderApiApp } from '../betaReaderApp.server';
import { chapterApp } from '../chapterApp.server';
import { shareablePreviewURLApp } from '../previewApp.server';
import { reviewRouter } from '../reviewsApp.server';
import { statFreshApp } from '../statsApp.sever';
import { MediaUploadApp } from '../media.svelte';
import { userApp } from '../userApp.server';
import { SettingApp } from '../userConfigs.server';
import { followerApp } from '../followerApp.server';
import { externalAuthApp } from '../externalAuthApp.server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type postgres from 'postgres';
import type { Sql } from 'postgres';

export type apiEnv = {
	Bindings: Env;
	Variables: {
		requestHandler: {
			locals: {
				user: User;
				user_id: string;
				sql: () => Sql;
				//supabase: SupabaseClient<Database>;
				profile: profileSelected;
			} /*   App.Locals */;
			platform: App.Platform;
		};
	};
};
/* declare module 'hono' {
	interface ContextVariableMap {
		requestHandler: { locals: App.Locals; platform: App.Platform };
	}
} */
import { contextStorage, getContext } from 'hono/context-storage';
import type { Database } from '$lib/types';
import type { profileSelected } from '$lib/queries/user/fields';
import { messageWorker } from '../message.server';
import { chatApp } from '../chatroom.server';
import type { Env } from '../../../../../worker-configuration';
import { bookSync } from '../utils/middleware.server';

let global_vars = {}; // need to be reset on every request
function createClient(props: apiEnv['Variables']['requestHandler']) {
	let hapi = new Hono()
		.use(logger())
		.use(contextStorage())
		.use(async (_, next) => {
			//@ts-expect-error
			_.set('requestHandler', props);
			//console.log('Req', props.request.url);
			//	console.log('Req', await props.locals.supabase.auth.getUser());
			const res = await next().catch((v) => {
				return { error: v };
			});
			//@ts-expect-error
			if (res.error) return _.json(res.error, 400);
		})
		.use(bookSync)
		.basePath('/rest/api')
		.route('/comments', commentApp)
		.route('/books', booksApp)
		.route('/previews', shareablePreviewURLApp)
		.route('/artworks', artworkApp)
		.route('/chapters', chapterApp)
		.route('/stats', statFreshApp)
		.route('/reviews', reviewRouter)
		.route('/upload', MediaUploadApp)
		.route('/betareader', betaReaderApiApp)
		.route('/user_setting', SettingApp)
		.route('/self', userApp)
		.route('/message', messageWorker)
		.route('/follow', followerApp)
		.route('/chatter', chatApp);
	// .route('/externalOauth', externalAuthApp);

	return hapi;
}
let hapi: ReturnType<typeof createClient>;

export const fallback: RequestHandler = (props) => {
	console.log('calling endpoints');
	// we need to update var per request to avoid two user using same hono instance which can cause session sharing which is
	// for (let k in global_vars) {
	// 	global_vars[k] = null;
	// }
	// Object.assign(global_vars, props);
	hapi = createClient(props);
	return hapi.fetch(
		props.request,
		props.platform?.env,
		//@ts-expect-error
		props.platform?.context
	);
};

//type AppType = typeof app;
export type AppType = ReturnType<typeof createClient>;
