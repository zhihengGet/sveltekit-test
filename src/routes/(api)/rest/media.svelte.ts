import { ImageTypes } from '$lib/queries';
import { CustomError, loginError } from '$lib/queries/base/errors';
import {
	getObjectPathV2,
	getPublicArtworkUrlSync,
	getPublicAvatarUrlSync,
	getPublicBookCoverUrlSync
} from '$lib/queries/storage/ObjectKey';
import { cleanQueryString } from '$lib/queries/util';
import { BigIntIdsZod } from '$lib/schema/querySchema/zodPagination';
import { supabase } from '$lib/supabaseClient/client';
import { zValidator } from '@hono/zod-validator';
import { error } from '@sveltejs/kit';
import { Hono } from 'hono';
import * as z from 'zod';
import {
	validateFileSize,
	validatePicFile
} from '../route/protected/storage/clients.server';
import type { apiEnv } from './[...paths]/+server';
import { genID } from './utils/getUUID';

// make url new, so that cf no cache
function addInvalidatePostfix(href: string) {
	return href + '?invalidate=' + Date.now();
}
const uploadProtected = new Hono<apiEnv>()
	.post(
		'/book_cover',
		zValidator(
			'form',
			z.object({
				image: z.instanceof(File)
			})
		),
		zValidator('query', z.object({ book_id: BigIntIdsZod })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			const user_id = requestHandler.locals.user_id;
			// check if book is users
			const file = await req.formData();
			const image = file.get('image') as File;
			await validatePicFile(image, true);
			if (!image.type.startsWith('image'))
				return json({ error: 'Invalid image type' }, { status: 400 });
			const data = await supabase
				.from('books')
				.select('*', { head: true })
				.eq('author_id', user_id)
				.eq('id', query.book_id)
				.single();
			if (data.error) {
				error(400, 'Invalid book id');
			}
			const cacheKey = getPublicBookCoverUrlSync({
				book_id: query.book_id,
				user_id: user_id
			});
			const objectkey = getObjectPathV2({
				type: ImageTypes.bookCover,
				...query,
				user_id: user_id
			});
			const r = await requestHandler.platform!.env.R2_Image.put(
				objectkey,
				image,
				{
					httpMetadata: { cacheControl: 'public,max-age=120' }
				}
			);
			//FIXME do server side update profile cover url with invalidate
			//await supabase.from('books').update({ cover_url: addInvalidate(r.key) });
			console.log('put', r);
			return json({ link: cacheKey });
		}
	)
	.post(
		'/avatars',
		zValidator(
			'form',
			z.object({
				image: z.instanceof(File)
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const image = req.valid('form').image;
			const user_id = requestHandler.locals.user_id;
			console.log('result', image, user_id);
			if (!(await validatePicFile(image))) {
				throw new Error('Invalid file');
			}
			console.log('get key');
			let cacheKey =
				getPublicAvatarUrlSync({
					uid: user_id
				}) +
				'?invalidate=' +
				Date.now();
			const objectKey = getObjectPathV2({
				type: ImageTypes.avatar,
				user_id: user_id
			});
			const r = await requestHandler.platform!.env.R2_Image.put(
				objectKey,
				image,
				{
					httpMetadata: { cacheControl: 'public,max-age=120' }
				}
			);
			// update profile with new URL
			//TODO
			await supabase
				.from('profiles')
				.update({ avatar_url: cacheKey })
				.eq('id', user_id);
			return json({ link: cacheKey });
		}
	)
	.post(
		'/artworks',
		zValidator(
			'query',
			z.preprocess(
				(data) => cleanQueryString(data),
				z.object({
					name: z.string().max(100),
					book_id: BigIntIdsZod,
					chapter_id: BigIntIdsZod.optional(),
					description: z.string().max(300).default(''),
					ai: z.boolean().default(false)
				})
			)
		),
		zValidator(
			'form',
			z.object({
				image: z.instanceof(File)
				/* 	name: z.string().max(100),
				book_id: BigIntIdsZod,
				chapter_id: BigIntIdsZod.optional(),
				description: z.string().max(300).default(''),
				ai: z.boolean().default(false) */
			})
		),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('query');
			console.log(query);
			const request = req;
			const url = requestHandler.url;
			const uid = requestHandler.locals.session?.user.id;
			const file = await request.formData();
			if (!uid) throw loginError;
			let cacheKey = '';
			const f = req.valid('form').image;
			//const type =   await fileTypeFromBuffer(await f.arrayBuffer());
			if (validateFileSize(f) === false)
				return error(400, { message: 'Too Big 5mb' });
			if (!f.type.startsWith('image'))
				return json({ error: 'invalid image type' }, { status: 400 });

			const length = await supabase
				.from('artworks')
				.select('user_id,artwork_id', { head: true, count: 'exact' })
				.eq('user_id', uid);

			if (length.error) {
				return error(400, { message: length.error.message });
			}
			if (length.count == 200) {
				return error(400, {
					message: 'Whoa! You’ve hit the max of 200 files!'
				});
			}
			const profile = requestHandler.locals!.profile;
			if (!profile) {
				throw loginError;
			}
			const db = await supabase
				.from('artworks')
				.insert({
					...query,
					user_id: uid,
					username: profile.username,
					artwork_id: genID()
				})
				.select('artwork_id,book_id,chapter_id,name,description,url,user_id')
				.single();

			if (db.error) {
				console.log('inserting images err', db.error);
				throw new CustomError(db.error.message, 'Failed to Insert Image to db');
			}
			cacheKey = getPublicArtworkUrlSync({
				...query,
				user_id: uid,
				artwork_id: db.data.artwork_id
			});

			const update = await supabase
				.from('artworks')
				.update({ url: cacheKey, username: profile.username })
				.eq('artwork_id', db.data.artwork_id)
				.single();
			if (update.error) {
				console.log('error with update', update);
				throw update.error;
			}
			//TODO check if book_id, chapter_id exists ?
			// upload to r2
			const objectPath = decodeURIComponent(new URL(cacheKey).pathname).replace(
				'//',
				'/'
			);
			const r = await requestHandler.platform!.env.R2_Image.put(objectPath, f, {
				httpMetadata: { cacheControl: 'public,max-age=120' }
			});
			if (!r) {
				// failed to save, revert
				const d = await supabase
					.from('artworks')
					.delete()
					.match({ artwork_id: db.data.artwork_id });
				throw new CustomError('Failed to upload your image!Try again later');
			}
			return json({ link: cacheKey, file: f.name, ...r, db: db.data });
			// save generated URL back to db
		}
	)
	.delete(
		'/artwork',
		zValidator('json', z.object({ artwork_id: z.string().uuid() })),
		async ({ req, env, executionCtx, json, var: { requestHandler } }) => {
			const query = req.valid('json');
			const uid = requestHandler.locals.user_id;
			const platform = requestHandler.platform;
			const remove = await requestHandler.locals.supabase
				.from('artworks')
				.delete()
				.eq('artwork_id', query.artwork_id)
				.eq('user_id', uid)
				.select('*')
				.single();

			if (remove.error) throw remove.error;
			const key = getObjectPathV2({
				...remove.data,
				type: ImageTypes.artwork,
				user_id: uid
			});
			if (!key) throw Error('bad image path');
			const r = await platform!.env.R2_Image.delete(key);
			console.log('purge cache', r);
			return new Response(`DELETE ${key} successfully!`);
		}
	);
export const MediaUploadApp = new Hono()
	.route('/protected', uploadProtected)
	.onError((e, { json }) => {
		return json({ message: e.message }, 400);
	});
