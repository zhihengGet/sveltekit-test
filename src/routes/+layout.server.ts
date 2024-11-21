// src/routes/+layout.server.ts

import type { profile } from '$lib/types/index.js';

export const load = async ({
	locals: { session, profile },
	request,
	cookies
}) => {
	//const s = await getSession();

	console.log('🚀 ~ file: +layout.server.ts:4 ~ load ~ session:', session);
	const userAgent = request.headers.get('user-agent'); // get the user-agent from the headers
	const m = /iPhone|iPad|iPod|Android/i.test(userAgent ?? '');

	return {
		isMobile: m,
		session: session,
		cookies: cookies.getAll(),
		profile: profile
	};
};
