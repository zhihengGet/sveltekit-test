import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabaseServer } from '$lib/supabaseClient/client.server';
import { z } from 'zod';
import { nanoid } from '@milkdown/kit/utils';

export const load: LayoutServerLoad = async ({
	params,
	url,
	locals: { user_id }
}) => {
	const room_id = params.room_id;
	const secret = url.searchParams.get('secret');
	const isUuid = z.string().uuid();
	// check if room exists
	// check if secret matches
	if (!user_id) {
		return { error: 'Please login !' };
	}
	if (isUuid.safeParse(isUuid).error) {
		return { error: 'Not Valid Room Id' };
	}
	if (!secret) {
		return { error: 'Missing Secret' };
	}
	const data = await supabaseServer()
		.from('chatrooms')
		.select('*')
		.eq('secret', secret)
		.eq('room_id', room_id);

	if (data.data && !data.error) {
		// add to room

		return { success: true };
	}
};
