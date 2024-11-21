import { supabaseClient as supabase } from '$lib/supabaseClient/client';
import { createQuery as useQuery } from '@tanstack/svelte-query';
import type {
	Join,
	UnionToTuple,
	full_profile,
	profile,
	profileWithUserData
} from '$lib/types';
import { CustomError, loginError } from '../base/errors';
import {
	profileField,
	profilePublicField,
	user_profile_data_fields
} from './fields';
import { getLocalUser } from './getUser';
import { getPublicAvatarUrlSync } from '../storage/ObjectKey';
import { sqlInstance } from '$lib/supabaseClient/postgresInstance.server';
import { supabaseServer } from '$lib/supabaseClient/client.server';

export async function getUserProfile(user: Partial<profile> | null) {
	const uid = (await getLocalUser().catch((e) => null))?.id;
	console.log('🚀 ~ get user profile server:', uid, user);
	let info = supabaseServer().from('profiles');
	if (!uid && !user) throw new CustomError('Must supply user id ');
	if (uid) {
		info = info
			.select(
				`${profileField},user_profile_data!user_profile_data_target_fkey(${user_profile_data_fields})`
			)
			.eq('user_profile_data.self', uid);
	} else {
		info = info.select(`${profileField}`);
	}
	if (user) {
		info = info.match(user);
	} else {
		info = info.eq('id', uid);
	}

	const { data, error } = await info.maybeSingle();
	if (error) {
		console.error('get user profile ssr failed', error);
	}
	if (!data?.avatar_url && data) {
		console.warn('Setting default avatar url');
		data.avatar_url = getPublicAvatarUrlSync({ uid: uid });
	}
	if (!error && data) data.user_profile_data = data?.user_profile_data?.[0];
	return { data, error } as { data: profileWithUserData; error: any };
}
