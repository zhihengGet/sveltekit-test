import type { chatrooms, user_chatroom_data } from '$lib/types';
export type IncomingMessages =
	import('$packages/chatroom/src/index').IncomingMessages;
export type room_info =
	import('$packages/chatroom/src/index').ChatRoom['room_info'];
export type room_user = import('$packages/chatroom/src/index').user;
export let chatStore: {
	create: boolean;
	selectedChat: chatrooms | null /* room info from db */;
	openRoomInfo: boolean /* room info from db */;
	openRoomStats: boolean /* room info from db */;
	roomToEdit: chatrooms | null;
	edit: boolean;
	wsRoomInfo: room_info | null /* room update from ws */;
	openUserDialog: boolean;
	user: user_chatroom_data | null /* selected user */;
	currRoomUser: user_chatroom_data | null /* logged in user , myself */;
	is_room_readonly: boolean;
} = $state({
	create: false,
	openRoomInfo: false,
	openRoomStats: false,
	openUserDialog: false,
	selectedUser: null,
	room: null,
	chatRoomInfo: null,
	roomToEdit: null,
	edit: false,
	currRoomUser: null,
	is_room_readonly: false,
	user: null //durable
});
export let openState = $state({
	openMute: false,
	openResource: false,
	openKick: false,
	openUserDialog: false,
	openManager: false,
	openMuteAll: false,
	openBan: false,
	openPromote: false,
	openInbox: false
});
export let refStates: { ref_message: IncomingMessages['message'] | null } =
	$state({
		ref_id: '',
		ref_message: undefined
	});

export let writerStore = $state({ content: '' });
export function createRoom() {
	chatStore.roomToEdit = null;
	chatStore.create = true;
}
export function editRoom(room: chatrooms) {
	chatStore.roomToEdit = room;
	chatStore.create = true;
}
export function selectChat(room: chatrooms) {
	if (room.room_id == chatStore.selectedChat?.room_id) {
		return;
	}
	chatStore.user = null;
	chatStore.currRoomUser = null;
	chatStore.wsRoomInfo = null;
	chatStore.selectedChat = room;
}

export function setRefMessage(message: IncomingMessages['message']) {
	refStates.ref_message = message;
}
export function resetRefMessage() {
	refStates.ref_message = null;
}
