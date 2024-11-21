import type { artwork } from '$lib/types';

export const BUCKETS: { [s in keyof typeof ImageTypes]: string } = {
	avatar: 'public', // binding R2_Image
	bookCover: 'public',
	artwork: 'public'
} as const;
export const imageTypeList = ['avatar', 'bookCover', 'artwork'] as const;
export const ImageTypes = {
	avatar: 'avatar',
	bookCover: 'bookCover',
	artwork: 'artwork'
} as const;
export type uploadType = keyof typeof ImageTypes;
export type uploadArtworkType = { file: File } & Pick<
	artwork,
	'name' | 'book_id' | 'chapter_id'
>;
