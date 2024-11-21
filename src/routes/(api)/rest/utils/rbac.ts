//design a permission system
import { contextStorage, getContext } from 'hono/context-storage';
import type { apiEnv } from '../[...paths]/+server';
import { KV } from './kv';
// You can access the variable outside the handler.
const getPlatform = () => {
	return getContext<apiEnv>().var.requestHandler;
};
/* deny until allowed */
type bookPerm = {
	is_public: boolean;
	blocked: { user_id: string; expired: number }[];
	allowed: { user_id: string; expired: number }[];
	collaborators: [];
	preview_ids: string[]; //override blocked
	hide_from_all: boolean; //override all previous
	hide_except_follower: boolean;
	hide_except_shelf: boolean;
};
type output = {
	blocked: { user_id: string; expired: number }[];
	allowed: { user_id: string; expired: number }[];
	preview_ids: string[]; //override blocked
	hide_from_all: boolean; //override all previous
	hide_except_follower: boolean;
	hide_except_shelf: boolean;
};
//fetch from kv ?
export const permission = {
	book_access: async ({
		book_id,
		user_id
	}: {
		book_id: string;
		user_id: string;
	}) => {
		const platform = getPlatform();
		// given a book and a user return if book can be a  Accessed by user
		const perm = await platform.platform.env.kv_cache.get(
			KV.BOOK_PERMISSION_GRID({ book_id }),
			{ type: 'json' }
		);

		return {
			read: false, // read book(i.e book page), shelf book
			write: false, // modify book data
			is_owner: false,
			temp_read: false, //preview url
			temp_write: false,
			expireAt: new Date() //
		};
	}
};
