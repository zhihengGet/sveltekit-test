import { HOUR, MINUTE, SITE_URL } from '$lib/data/constants';
import type { chatrooms, user_chatroom_data } from '$lib/types';
import { untrack } from 'svelte';
import {
	chatStore,
	type IncomingMessages,
	type room_user
} from './store.svelte';
import { remove } from 'lodash-es';
import { toastNotify } from '$lib/utils/toast';
import { useDebounce } from 'runed';
import { notifyMe } from '../../(api)/rest/utils/web';
import { user } from '$lib/state/runes.svelte';
import type { chat_roles } from '$lib/schema/chatSchema';

export const statusToBackgroundColor: {
	[s in user_chatroom_data['status']]: string;
} = {
	away: 'lightgray',
	offline: 'gray',
	online: 'green',
	resting: 'lightblue',
	typing: 'pink',
	vacation: 'orange',
	banned: 'gray' /* don't need */,
	kicked: 'gray' /* don't need */
};
type mute_date = {
	start_date?: string | number | null;
	duration?: number | null;
};

export function useCount(
	args: () => {
		countDown: boolean;
		start: number;
		duration?: number;
		restart?: boolean;
		enable?: boolean;
		cb?: () => void;
	}
) {
	let { countDown, start, duration, restart, enable, cb } = $derived(args());
	let time = $state(Math.round(start) ?? 0);
	$effect(() => {
		if (start && countDown) {
			time = start;
		} else {
			time = 0;
		}
	});
	$effect(() => {
		console.log('timer', args());
		let t = setInterval(() => {
			if (countDown) {
				if (time > 1) time -= 1;
				if (time <= 0) {
					cb?.();
					if (!restart) return clearInterval(t);
				}
			} else {
				time += 1;
				if (time >= start + duration) {
					cb?.();
					if (!restart) return clearInterval(t);
				}
			}
			console.log('running timer', time);
		}, 1000);

		return () => clearInterval(t);
	});
	return () => time;
}
export function checkExpirationDates(
	start: string | number | null | undefined,
	duration: number | null | undefined
) {
	let n = Date.now();
	const is_valid = start && duration;
	let start_date = start ? new Date(start).getTime() : 0;
	let ender = start_date && duration ? start_date + duration : 0;
	let muted_now = n > start_date && n < ender;
	let muted_scheduled = start_date > n && start_date < ender;
	return is_valid
		? {
				is_muted: n > start_date && n < ender,
				start_date,
				readable_start_date:
					start_date <= n ? 'now' : new Date(start_date).toUTCString(),
				readable_end_date: new Date(ender).toUTCString(),
				end_date: ender,
				minutes: Math.ceil((ender - n) / MINUTE),
				hr: Math.ceil((ender - n) / HOUR),
				muted_summary: `This user is muted for ${Math.ceil((ender - n) / MINUTE)} minutes , starting from ${new Date(start_date).toUTCString()}`,
				isScheduledMute: start_date > n && start_date < ender,
				isMutedNowOrLater: muted_now || muted_scheduled
			}
		: {
				is_muted: false,
				minutes: 0,
				end_date: 0,
				start_date: 0,
				isMutedNowOrLater: false,
				isScheduledMute: false
			};
}
export function useCheckMuteInfo(
	params: () => {
		mute_params: mute_date;
		countdown: boolean;
	}
) {
	let reset = $state(false);
	$effect(() => {
		if (params()) untrack(() => (reset = false));
	});
	let check_mute_room = $derived(
		checkExpirationDates(
			params().mute_params.start_date,
			params().mute_params.duration
		)
	);
	let is_muted = $derived(check_mute_room.is_muted);
	$inspect('timer', reset, params());
	const time = params().countdown
		? useCount(() => {
				return {
					countDown: true,
					start: Math.max(
						Math.trunc((check_mute_room.end_date - Date.now()) / 1000),
						0
					),
					enable: is_muted,
					restart: false,
					cb: () => {
						untrack(() => {
							reset = true;
						});
					}
				};
			})
		: () => null;
	return () => {
		if (reset) {
			return {
				is_muted: false,
				mute_info: checkExpirationDates(
					params().mute_params.start_date,
					params().mute_params.duration
				),
				time: 0
			};
		}
		return {
			is_muted,
			mute_info: check_mute_room,
			time: time()
		};
	};
}

export function useMuteInfo(
	params: () => {
		mute_user?: mute_date;
		mute_all?: mute_date;
		current_user?: mute_date;
	}
) {
	let check_mute_room = $derived(
		checkExpirationDates(
			params().mute_all?.start_date,
			params().mute_all?.duration
		)
	);
	let check_mute_user_ws = $derived(
		checkExpirationDates(
			params().mute_user?.start_date,
			params().mute_user?.duration
		)
	);
	let check_mute_user = $derived(
		checkExpirationDates(
			params().current_user?.start_date,
			params().current_user?.duration
		)
	);

	let mute_info = $derived(
		check_mute_room.is_muted
			? check_mute_room
			: check_mute_user.is_muted
				? check_mute_user
				: check_mute_user_ws
	);
	let is_muted = $derived(
		check_mute_room.is_muted ||
			check_mute_user_ws.is_muted ||
			check_mute_user.is_muted
	);
	return () => {
		return { is_muted, mute_info };
	};
}

export function useUserStatusUpdate() {}

/**
 * @description
 * @param args
 */
export function useUserSyncWS(
	args: () => {
		users: user_chatroom_data[];
		new_users: user_chatroom_data[];
	}
) {
	// take data from ws and sync with states
	$effect(() => {
		let { users, new_users } = args();
		// handle user  update
		if (users && new_users) {
			untrack(() => {
				/* merge  */
				mergeUser(users, new_users);
				/* new user joined */
				for (let x of new_users) {
					let target = users.find((v) => v.user_id == x.user_id);
					if (!target) {
						users.push(x);
					}
				}
			});
		}
	});
}

let global_message_cache = {}; // per room
/**
 * @description
 * @param args
 */
export function WSSync(message: IncomingMessages) {
	// take data from ws and sync with states
	$effect(() => {
		let { users, new_users } = args();
		// handle user  update
		if (users && new_users) {
			untrack(() => {
				/* merge  */
				mergeUser(users, new_users);
				/* new user joined */
				for (let x of new_users) {
					let target = users.find((v) => v.user_id == x.user_id);
					if (!target) {
						users.push(x);
					}
				}
			});
		}
	});
}
export function mergeUser(
	users: user_chatroom_data[],
	new_users: Partial<user_chatroom_data>[]
) {
	for (let x of users) {
		let target = new_users.find((v) => v.user_id == x.user_id);
		if (target) {
			Object.assign(x, target);
			if (chatStore.user?.user_id === target.user_id) {
				// also update selected user
				chatStore.user = x;
			}
		}
	}
	for (let x of new_users) {
		let target = users.find((v) => v.user_id == x.user_id);
		if (!target) {
			//new user
			users.push(x);
		}
	}
}
export function removeUser(
	users: user_chatroom_data[],
	target: { user_id: string }
) {
	remove(users, (v) => v.user_id == target.user_id);
	if (chatStore.user?.user_id === target.user_id) {
		// also update selected user
		chatStore.openUserDialog = false;
		chatStore.user = null;
	}
}
export function mergeRoom(rooms: chatrooms[], new_rooms: Partial<chatrooms>[]) {
	for (let x of rooms) {
		let target = new_rooms.find((v) => v.room_id == x.room_id);
		if (target) {
			Object.assign(x, target);
			if (chatStore.selectedChat?.room_id === target.room_id) {
				// also update selected user
				chatStore.selectedChat = x;
			}
		}
	}
}
export const autoVivify = () =>
	new Proxy(
		{},
		{
			get: (target, prop) => {
				if (!(prop in target)) {
					target[prop] = autoVivify();
				}
				return target[prop];
			}
		}
	);

export function useUserLeftWS(
	args: () => {
		users: user_chatroom_data[];
		left_user: { user_id: string };
	}
) {
	$effect(() => {
		let { users, left_user } = args();
		// handle ban/kick/quit users
		if (users && left_user) {
			untrack(() => {
				let target = users.findIndex((v) => v.user_id == left_user.user_id);
				if (target >= 0) users.splice(target, 1);
			});
		}
	});
}

export function getChatInviteURL(room_id: string, secret?: string) {
	return SITE_URL + 'chat/invite/' + room_id + '?secret=' + secret;
}
export async function CopyInviteURL(room_id: string, secret?: string) {
	await navigator.clipboard.writeText(getChatInviteURL(room_id, secret));

	toastNotify.info(
		'Share Link Copied ! You can simply share it with your future group member!'
	);
}

export function useTyping(fn: (typing: boolean) => void) {
	let is_typing = $state(false);
	let isFirstTime = $state(true);
	const deb = useDebounce(() => {
		is_typing = false;
		isFirstTime = true;
		fn(false);
	}, 2000);
	return {
		update: () => {
			if (isFirstTime) {
				isFirstTime = false;
				is_typing = true;
				fn(true);
			}
			deb();
		},
		is_typing: () => is_typing,
		deb: deb
	};
}
function isMention(s: string, users: room_user[]) {}
export function notifyUser(message: IncomingMessages['message']) {
	if (
		message?.reply_id === user.id &&
		message.user_id !== user.id &&
		Date.now() - new Date(message.created_at).getTime() <= 2000
	) {
		notifyMe({
			body: '',
			title: 'Someone replied to your message💬'
		});
	}
}
export const roleIcons: { [s in chat_roles]: string } = {
	admin: '👑',
	moderator: '🕵️‍♂️',
	user: '🖇️'
};

export function isMod(user: room_user) {
	return user?.role == 'moderator';
}
export function isAdmin(user: room_user) {
	return user?.role == 'admin';
}
export function isUser(user: room_user) {
	return !isMod(user) && !isAdmin(user);
}
export function isModOrAdmin(user: room_user) {
	return isMod(user) || isAdmin(user);
}
