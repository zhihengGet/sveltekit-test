import { dev } from '$app/environment';
import type { apiEnv } from '../[...paths]/+server';
import { DO_GEN } from './kv';
export async function getChatStub({
	requestHandler,
	room_id,
	secret
}: {
	requestHandler: apiEnv['Variables']['requestHandler'];
	room_id: string;
}) {
	const id = requestHandler.platform.env.chatroom.idFromName(
		DO_GEN.ChatRoom({ room_id: room_id })
	);
	const data = requestHandler.platform.env.chatroom.get(id);
	return data as unknown as import('$packages/chatroom/src/index').ChatRoom;
}

export async function DisposeRPC(data: any) {
	if (data && typeof data[Symbol.dispose] == 'function') {
		console.log('disposing RPC', data);
		data[Symbol.dispose]();
	} else {
		console.info('No Symbol.dispose method on rpcResult');
	}
}
