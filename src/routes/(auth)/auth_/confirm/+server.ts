import { redirect, type ServerLoad } from '@sveltejs/kit';

export const GET: ServerLoad = async (event) => {
	console.log('🚀 ~ constGET:ServerLoad= ~ event:', event.url);

	const {
		url,
		locals: { supabase }
	} = event;
	const token_hash = url.searchParams.get('token_hash') as string;
	const type = url.searchParams.get('type') as string;
	const next = url.searchParams.get('next') ?? '/';

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ token_hash, type });
		if (!error) {
			redirect(303, `/${next.slice(1)}`);
		}
		console.error('error in confirm otp', error);
		redirect(303, '/auth?msg=' + 'Invalid Token');
	}

	// return the user to an error page with some instructions
	redirect(303, '/auth?msg=' + 'Invalid Token');
};
