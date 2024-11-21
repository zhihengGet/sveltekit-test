import { PUBLIC_BUCKET_URL } from '$env/static/public';
import { CustomError, uploadFormatError } from '../base/errors';
import { getUserIDFromLocalStorage } from '../user';
import type { ImageTypes, uploadType } from './constants';
import { UploadSchema } from '$lib/schema/upload';
import { z } from 'zod';
import type { ID } from '$lib/types';
export function fileExtension(filename: string) {
	const ext = filename.split('.').pop();
	if (!ext) {
		console.error('file extension does not exists', filename);
		throw uploadFormatError;
	}
	return '.' + ext;
}
export async function imagePath(filename: string) {
	const uid = await getUserIDFromLocalStorage();
	return imagePathV2({ filename, user_id: uid });
}
export function imagePathV2({
	filename,
	user_id
}: {
	filename: string;
	user_id: string;
}) {
	const uid = user_id;
	return '/images/' + uid + '/' + filename;
}
export const addExt = (s: string | number) => s + '.jpeg'; // every image will be ended with .jpeg
/**
 * @deprecated use getObjectPathV2
 * @param param0
 * @returns
 */
export async function getObjectPath({
	type,
	...props
}: {
	type: uploadType;
	artwork_id?: string | null;
	chapter_id?: number | string | null;
	book_id?: number | string | null;
	fallback?: string | null;
}) {
	const uid = await getUserIDFromLocalStorage();
	return getObjectPathV2({ type, user_id: uid, ...props });
}
/**
 *
 * @description get object path in R2 , not full URL
 */
export function getObjectPathV2({
	type,
	...props
}: {
	type: uploadType;
	artwork_id?: number | string | null;
	chapter_id?: number | string | null;
	book_id?: number | string | null;
	//fallback?: string | null;
	user_id: string;
}) {
	let fn = '';
	if (type === 'avatar') {
		fn = addExt('avatar');
	}
	if (type == 'bookCover' && props.book_id) {
		fn = addExt(props.book_id);
	}
	if (type === 'artwork') {
		// dynamic URL, saved to supabase with metadata
		if (props.chapter_id) {
			fn = addExt(props.book_id + '/' + props.artwork_id);
		} else fn = addExt(props.book_id + '/' + props.artwork_id);
	}
	if (!fn) throw 'please add an valid file type';
	return imagePathV2({ filename: fn, user_id: props.user_id });
}
export async function getBucket({ type }: { type: uploadType }) {
	if (type === 'avatar' || type === 'bookCover' || type == 'artwork') {
		return PUBLIC_BUCKET_URL;
	}
}
/**
 * @description get public book url which is immutable,
 * @returns
 */
export function getPublicBookCoverUrlSync({
	book_id: bid,
	user_id: uid
}: {
	book_id: number | string;
	user_id: string;
}) {
	const url = new URL(
		encodeURIComponent(
			getObjectPathV2({ type: 'bookCover', book_id: bid, user_id: uid })
		),
		PUBLIC_BUCKET_URL
	);
	return url.href;
}
/**
 * @description get public avatar url which is immutable,
 * @returns
 */
export function getPublicArtworkUrlSync({
	book_id: bid,
	user_id: uid,
	chapter_id: cid,
	artwork_id
}: {
	book_id: ID;
	user_id: ID;
	chapter_id?: string;
	artwork_id: ID;
}) {
	const schema = UploadSchema.safeParse({
		book_id: bid,
		artwork_id,
		chapter_id: cid,
		type: 'artwork'
	});
	if (schema.success === false) {
		console.error(schema.error);
		throw new CustomError('Invalid Artwork Upload Param');
	}
	const url = new URL(
		encodeURIComponent(
			getObjectPathV2({
				...schema.data,
				user_id: uid
			})
		),
		PUBLIC_BUCKET_URL
	);
	return url.href;
}
/**
 * @description get immutable avatar url
 * @param param0
 * @returns
 */
export function getPublicAvatarUrlSync({ uid }: { uid: string }) {
	// r2
	return new URL(
		encodeURIComponent(getObjectPathV2({ type: 'avatar', user_id: uid })),
		PUBLIC_BUCKET_URL
	).href;
}
