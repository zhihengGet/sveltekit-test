import type {
	Join,
	UnionToTuple,
	full_profile,
	profile,
	user_profile_data
} from '$lib/types';

export const profilePubFields: (keyof profile)[] = [
	'about_you',
	'id',
	'avatar_url',
	'created_at',
	'updated_at',
	'username',
	'language',
	//'birthday',
	//'age',
	'occupation',
	'industry',
	'dislike_count',
	'like_count',
	'is_beta_reader',
	'tags',
	'role',
	'follower_count',
	'review_count',
	'comment_count',
	'review_like_count',
	'comment_like_count',
	'book_visited_count'
] as const;
const fields = [
	...profilePubFields,
	'about_you',
	'id',
	'avatar_url',
	'created_at',
	'updated_at',
	'username',
	'language',
	'birthday',
	//'age',
	'occupation',
	'industry',
	'dislike_count',
	'like_count',
	'user_modified_at',
	'is_beta_reader',
	'extra',
	'tags',
	'role',
	'follower_count',
	'follower_count',
	'review_count',
	'comment_count',
	'review_like_count',
	'comment_like_count'
] as const;
//@ts-expect-error
export const profileField: Join<
	UnionToTuple<(typeof fields)[number]>,
	','
> = fields.join(',');

export type profileSelected = Pick<full_profile, (typeof fields)[number]>;

// other people's profile
export type profilePublic = Pick<full_profile, (typeof fields)[number]>;
//@ts-expect-error
export const profilePublicField: Join<
	UnionToTuple<(typeof profilePubFields)[number]>,
	','
> = profilePubFields.join(',');
export const user_profile_data_list: (keyof user_profile_data)[] = [
	'created_at',
	'self',
	'target',
	'created_at',
	'user_modified_at',
	'is_follower'
] as const;
//@ts-expect-error
export const user_profile_data_fields: Join<
	UnionToTuple<(typeof user_profile_data_list)[number]>,
	','
> = user_profile_data_list.join(',');
