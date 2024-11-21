import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const fallback: RequestHandler = async ({ request, platform, url }) => {
	// Expect to receive a WebSocket Upgrade request.
	// If there is one, accept the request and return a WebSocket Response.
	console.log('hi', Date.now());
	// Expect to receive a WebSocket Upgrade request.
	// If there is one, accept the request and return a WebSocket Response.
	const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return new Response('Durable Object expected Upgrade: websocket', {
			status: 426
		});
	}

	// This example will refer to the same Durable Object instance,
	// since the name "foo" is hardcoded.
	let id = platform?.env.chatroom.idFromName('foo');
	console.log('object id', id);
	let stub = platform?.env.chatroom.get(id);
	console.log('stub', stub);
	const res = await stub.fetch('http://127.0.0.1:8787/websocket', {
		headers: request.headers
	});
	console.log(
		'Res',
		res.status,
		res.statusText,
		Object.fromEntries(res.headers.entries())
	);
	return res;
};
