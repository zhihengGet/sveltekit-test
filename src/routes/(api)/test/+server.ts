import type { RequestHandler } from './$types';
import crypto from 'crypto';
export const POST: RequestHandler = async ({ request, fetch, platform }) => {
	const id = await platform?.env.COUNTERS.idFromName('213');
	const stub = await platform.env.COUNTERS.get(id);
	console.log(await stub.fetch('http://127.0.0.1:8787'));
	return new Response(null, { status: 500 });
};
