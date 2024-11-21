import { cloneDeep, merge } from 'lodash-es';
import type { profile } from '$lib/types';
import type { status } from '.';
import type { profileSelected } from '$lib/queries/user/fields';
const initialUser: profileSelected & { authStatus: status } = {
	about_you: 'this person is a mystery',
	avatar_url: '',
	username: 'Just Visiting',
	created_at: new Date().toUTCString(),
	dislike_count: 0,
	id: '',
	language: 'world',
	like_count: 0,
	updated_at: new Date().toUTCString(),
	extra: null,
	authStatus: 'anon',
	is_beta_reader: true
};
export const user = $state(cloneDeep(initialUser));

//replace user store
export const setUserProfile = (profile: profile) => {
	merge(user, profile);
};
export const resetUserProfile = () => {
	merge(user, cloneDeep(initialUser));
};
