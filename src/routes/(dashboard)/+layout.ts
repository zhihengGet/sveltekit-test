export const ssr = false;

export const csr = true;
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent }) => {
	const data = await parent();
	if (data.session == null) {
		return error(401, 'Are you logged in ✓');
	}
};
