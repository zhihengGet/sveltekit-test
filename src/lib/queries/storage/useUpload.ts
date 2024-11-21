import { supabaseClient } from '$lib/supabaseClient/client';
import { createMutation } from '@tanstack/svelte-query';
import { dashboardBookStore } from '../../../routes/(dashboard)/dashboard/BookStore.svelte';
import {
	CustomError,
	removeUploadError,
	uploadFormatError
} from '../base/errors';
import { getUserIDFromLocalStorage } from '../user';

import { user } from '$lib/state/runes.svelte';
import type { artwork } from '$lib/types';
import { client } from '../api';
import { removeNil } from '../util';
import { ImageTypes, type uploadType } from './constants';
import {
	getPublicArtworkUrlSync,
	getPublicAvatarUrlSync,
	getPublicBookCoverUrlSync
} from './ObjectKey';
/**
 * @deprecated
 * @description get public avatar url which is immutable regardless the image
 * @returns
 */
export async function getPublicArtworkURL(props: {
	chapter_id: string | undefined | null;
	book_id: string;
	artwork_id: string;
}) {
	// r2
	return getPublicArtworkUrlSync({
		...props,
		user_id: await getUserIDFromLocalStorage()
	});
}
export async function uploadImage({
	file,
	...artwork
}: {
	file: File;
} & artwork) {
	if (file instanceof File == false || !artwork.book_id) {
		throw uploadFormatError;
	}
	const post = client.rest.api.upload.protected.artworks.$url({
		query: artwork
	});

	//const uuid = data.data?.artwork_id;
	const f = new FormData();
	f.set('image', file);
	const cleaned = removeNil(artwork);
	const url = new URLSearchParams(cleaned);
	for (let x of url.entries()) {
		post.searchParams.set(x[0], x[1]);
	}
	const t = await fetch(post.toString(), {
		method: 'POST',
		body: f
	});
	const data = await t.json();
	if (t.status !== 200)
		throw new CustomError(data?.message ?? 'Failed to upload');
	return data.db as artwork;
}
/**
 * @description get public avatar url which is immutable regardless the image
 * @returns
 */
export async function getPublicAvatarUrl() {
	const user_id = await getUserIDFromLocalStorage();
	return getPublicAvatarUrlSync({ uid: user_id });
}
export async function uploadAvatar({ file }: { file: File }) {
	if (file instanceof File == false) {
		throw uploadFormatError;
	}
	const post = client.rest.api.upload.protected.avatars.$url({
		form: { image: file }
	});

	//const uuid = data.data?.artwork_id;
	const f = new FormData();
	f.set('image', file);
	const t = await fetch(post.toString(), {
		method: 'POST',
		body: f
	});
	const data = await t.json();
	if (t.status !== 200)
		throw new CustomError(data?.message ?? 'Failed to upload');
	const publicAvatar = data.link;
	/* await updateUser({
		new_user: { avatar_url: publicAvatar },
		old: {}
	}); */
	return publicAvatar; // invalidate cache local for current user
}
/**
 * @description get public avatar url which is immutable
 * @returns
 */
export async function getPublicBookCoverUrl(bid: number | string) {
	return getPublicBookCoverUrlSync({
		book_id: bid,
		user_id: await getUserIDFromLocalStorage()
	});
}
export async function uploadBookCover({
	file,
	bookid
}: {
	bookid?: string | number;
	file: File;
}) {
	if (file instanceof File == false) {
		throw uploadFormatError;
	}

	const bid = bookid ?? dashboardBookStore.selectedBook?.id;

	if (!bid) {
		throw { message: 'bad id; upload book cover failed ' + bid };
	}
	// use bookId so that if book title change, url stay the same
	// if we reupload, url stay the same
	// don't need to update url at all
	//fixed extension
	const post = client.rest.api.upload.protected.book_cover.$url({
		query: { book_id: bookid }
	});

	//const uuid = data.data?.artwork_id;
	const f = new FormData();
	f.set('image', file);
	post.searchParams.set('book_id', bid);
	const t = await fetch(post.toString(), {
		method: 'POST',
		body: f
	});
	const data = await t.json();
	if (t.status !== 200)
		throw new CustomError(data?.message ?? 'Failed to upload');
	const url = await getPublicBookCoverUrl(bid);
	console.log(url);
	return url + '?invalidate=' + Date.now();
}
/**
 * @deprecated book cover is immutable
 * @param param0
 */
export async function removeBookCover({ bid }: { bid: string }) {
	if (!bid) {
		throw { message: 'cant remove missing bid' };
	}
	const t = await fetch(
		'/route/protected/storage?type=' + ImageTypes.bookCover + '&book_id=' + bid,
		{ method: 'DELETE' }
	);
	if (t.status !== 200) {
		throw removeUploadError;
	}
}

/**
 * @deprecated use cf instead
 * @param param0
 */
/* export function getImageUrl(bucket: string, path: string) {
	return supabaseClient.storage.from(bucket).getPublicUrl(path);
} */

export default function useUpload(type: uploadType) {
	return createMutation(() => {
		return {
			mutationFn: type == 'avatar' ? uploadAvatar : uploadBookCover,
			mutationKey: ['upload', type],
			meta: {
				toast: true,
				message: 'Image Uploaded'
			},
			onSuccess: (url) => {
				if (type === 'avatar') {
					user.avatar_url = url;
				}
			}
		};
	});
}
