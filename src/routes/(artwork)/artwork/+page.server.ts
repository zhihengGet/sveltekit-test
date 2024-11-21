import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals: { user }, parent }) => {
	if (!user) {
		error(403, { message: 'User Not Logged In' });
	}
	return {};
};
