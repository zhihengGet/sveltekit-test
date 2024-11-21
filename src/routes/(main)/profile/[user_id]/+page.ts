import type { PageLoad } from './$types';
/*
 * @description
 */
export const load = (async ({ params, data: serverdata, parent }) => {
	console.log('returning profile', serverdata);
	await parent();
	return {
		profile: serverdata.profile,
		publicProfile: serverdata.publicProfile,
		email: serverdata.email
	};
}) satisfies PageLoad;
