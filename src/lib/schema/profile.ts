import { userLimits } from '$lib/data/constants';
import { bookFilter, lang } from '$lib/data/filter';
import { industries } from '$lib/data/industry';
import { user_tag_select_items, user_tags } from '$lib/data/tags';
import type { profileSelected } from '$lib/queries/user/fields';
import { difference } from 'lodash-es';
import { z } from 'zod';

export const profileSchema = z.object(
	/* <profileSelected> */ {
		id: z.string().uuid(),
		occupation: z.string().trim(),
		industry: z
			.string()
			.trim()
			.refine((v) => {
				return industries.includes(v);
			}),
		//age: z.number().min(0).max(200).,
		birthday: z.string().date(),
		language: z.string().refine((v) => {
			return lang.find((t) => t.name === v);
		}),
		about_you: z.string(),
		tags: z
			.array(z.string())
			.nullable()
			.refine((t) => {
				return difference(
					t,
					user_tags.roles.map((v) => v.role)
				);
			}),
		username: z
			.string()
			.trim()
			.max(
				userLimits.MAX_USERNAME_LENGTH,
				"Username's length must be greater than " +
					userLimits.MAX_USERNAME_LENGTH
			)
			.min(1, 'Username must be greater than 1')
	}
);
