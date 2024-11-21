// src/routes/[...slugs]/+server.ts
import type { RequestHandler } from './$types';

import { Hono } from 'hono';
import { logger } from 'hono/logger';

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
import type { Env } from '../../../../../worker-configuration';
import { chatApp } from '../../rest/webSocketApp.server';

let global_vars = {}; // need to be reset on every request
function createClient(props: apiEnv['Variables']['requestHandler']) {
	let hapi = new Hono()
		.use(logger())
		.basePath('/ws')
		.route('/authorgroup', chatApp);
	// .route('/externalOauth', externalAuthApp);

	return hapi;
}
let hapi: ReturnType<typeof createClient>;

export const fallback: RequestHandler = (props) => {
	console.log('calling ws endpoints');
	// we need to update var per request to avoid two user using same hono instance which can cause session sharing which is
	for (let k in global_vars) {
		global_vars[k] = null;
	}
	Object.assign(global_vars, props);
	hapi = createClient(global_vars);
	return hapi.fetch(
		props.request,
		props.platform?.env,
		//@ts-expect-error
		props.platform?.context
	);
};
//type AppType = typeof app;
export type AppType = ReturnType<typeof createClient>;
