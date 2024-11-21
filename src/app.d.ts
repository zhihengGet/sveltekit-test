// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Database, profile } from '$lib/types';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type {
	EventContext,
	RequestInitCfProperties
} from '@cloudflare/workers-types';
import type { Counter } from '$lib/cf';
import type { counter } from '../../../packages/durable-objects/src';
import type { Env } from '../worker-configuration';
import type postgres from 'postgres';
import type { PostHog } from 'posthog-node';
import type { UserAgent } from '@edge-runtime/user-agent';
import type { profileSelected } from '$lib/queries/user/fields';
export type handlerLocal = {
	supabase: SupabaseClient;
	getSession: () => Promise<Session | null>;
};
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database, 'public'>;
			supabaseServer: SupabaseClient<Database, 'public'>;
			getSession: () => Promise<Session | null>;
			session: Session | null;
			user: User | null;
			user_id: string;
			sql: () => postgres.Sql;
			setServerClient: ({ cf }: { cf: RequestInitCfProperties }) => void;
			posthog: PostHog;
			userAgent: UserAgent;
			profile: profileSelected | null;
			cf: RequestInitCfProperties | null;
		}
		interface PageData {
			session: Session | null;
			profile: profile | null;
		}
		interface Platform {
			env: Env;
			context: { waitUntil: (promise: Promise<any>) => void };
			caches: CacheStorage & { default: Cache };
		}
		// interface Platform {}
	}
}
export {};
