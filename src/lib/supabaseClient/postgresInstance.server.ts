/* export const runIfAuth = async (fn: () => any) => {
	const user = await supabase.auth.getUser();
	console.log(user);
	if (!user.error && user.data.user) {
		// user is logged in

		return fn();
	}
	return fn();
}; */
import { SUPABASE_CONN_STRING } from '$env/static/private';
import postgres from 'postgres';

export const sqlInstance = () =>
	postgres(SUPABASE_CONN_STRING, {
		idle_timeout: 2,
		max: 20,
		prepare: false
		//ssl: 'prefer' //TODO add SSL
	});
/* import type { DB } from '../../../kysely'; // this is the Database interface we defined earlier
//import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely'; */

/* const dialect = new PostgresJSDialect({
	postgres: postgres({
		database: 'test',
		host: 'localhost',
		max: 10,
		port: 5434,
		user: 'admin'
	})
}); */
// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
/* export const kysely = new Kysely<DB>({
	dialect,
	log: ['query', 'error']
}); */
