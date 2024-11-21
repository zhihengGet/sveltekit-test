import type { PageServerLoad } from './$types';
import { throttler } from '../../../(api)/rest/utils/event';
import { DO_GEN } from '../../../(api)/rest/utils/kv';
import { getUserProfile } from '$lib/queries/user/user.server';
import { error } from '@sveltejs/kit';
import { kysely } from '$lib/supabaseClient/postgresInstance.server';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({
	request,
	params,
	locals,
	platform
}) => {
	// update user stats
	async function update() {
		if (locals.user?.id) {
			console.log('should update user stats');
			/* we update witha  denormalized way so that we can show a user leader board ? wip */

			const r = await locals.sql()`
                    update profiles set 
						like_count=COALESCE(r.a+cmmt.b,0), 
						dislike_count =COALESCE(r.ta+cmmt.tb,0), 
						review_like_count =COALESCE(r.a,0), 
						comment_like_count =COALESCE(cmmt.b,0), 
						follower_count = COALESCE(follower.tf,0),
						book_visited_count = coalesce(book_read.ubd,0)
                    from 
						/* reviews  */
                        (select sum(COALESCE(reviews.like_count,0)) as a,
						sum(greatest(reviews.dislike_count,0)) as ta
                        from profiles 
                        left join reviews on reviews.user_id=profiles.id
                        where profiles.id= ${locals.user.id}) as r,
					
						(select sum(COALESCE(comments.like_count,0)) as b, 
						sum(COALESCE(comments.dislike_count,0)) as tb
                        from profiles 
                        left join comments on comments.user_id = profiles.id
                        where profiles.id= ${locals.user.id}) as cmmt,

						(select 
						sum(1) filter (where is_follower = true ) as tf
                        from profiles 
                        left join user_profile_data on target = profiles.id
                        where profiles.id= ${locals.user.id}) as follower,


						(select 
						count(user_book_data.user_id) as ubd
                        from profiles 
						left join user_book_data on user_book_data.user_id = profiles.id
                        where profiles.id= ${locals.user.id}) as book_read

                    where profiles.id= ${locals.user.id}

					/* returning * */
                `;
			console.log('freshing user profile stat', r, locals.user.id);
		}
	}
	//await update();
	async function put() {
		if (!locals.user?.id) return;
		const canUp = await throttler({
			name: DO_GEN.UPDATE_USER_STATS(locals.user.id),
			gap: '5hr',
			platform: platform,
			reason: 'profile-stats'
		});
		if (canUp) await update();
	}
	platform?.context.waitUntil(put());
	if (locals.profile) {
		if (locals.profile.id == params.user_id)
			return {
				publicProfile: locals.profile,
				profile: locals.profile,
				email: locals.session?.user.email
			};
	}
	const user = await getUserProfile({ id: params.user_id });
	if (user.error) {
		error(400, {
			message: 'Error occurred while fetching profile !'
		});
	}
	if (!user.data) {
		error(400, {
			message: 'User does not exists!'
		});
	}
	return {
		profile: locals.profile,
		publicProfile: user.data,
		email: locals.session?.user.email // authenticated user's email not users
	};
};
