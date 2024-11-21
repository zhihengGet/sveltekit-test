import { Hono } from 'hono';
import type { apiEnv } from './[...paths]/+server';
import { upgradeWebSocket } from 'hono/cloudflare-workers';

const ChatRoomProtected = new Hono<apiEnv>().get(
	'/hi',
	async ({ req, header, env, executionCtx }) => {
		// Expect to receive a WebSocket Upgrade request.
		// If there is one, accept the request and return a WebSocket Response.
		const upgradeHeader = req.raw.headers.get('Upgrade');
		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 });
		}

		const webSocketPair = new WebSocketPair();
		const client = webSocketPair[0],
			server = webSocketPair[1];

		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}
);

export const chatApp = new Hono().route('/protected', ChatRoomProtected);
