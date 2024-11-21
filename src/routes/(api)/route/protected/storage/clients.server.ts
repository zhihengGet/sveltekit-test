import { env } from '$env/dynamic/private';
import { ZONE_PURGE } from '$env/static/private';
import {
	PutObjectCommand,
	S3Client,
	type PutObjectAclCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Cloudflare from 'cloudflare';
import { fileTypeFromBlob, type MimeType } from 'file-type';

export const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.ACCESS_KEY_ID,
		secretAccessKey: env.SECRET_ACCESS_KEY
	}
});

export async function getPresignedURL(
	props: PutObjectAclCommandInput,
	expire = 300
) {
	const presignedUrl = await getSignedUrl(
		S3,
		new PutObjectCommand({
			ContentType: 'image/*',
			ACL: 'public-read',
			...props
		}),
		{
			expiresIn: expire
		}
	);
	return presignedUrl;
}
export function validateFileSize(
	file: File,
	max: number = 1e6 * 5,
	throwOnError = true
) {
	const v = file.size <= max;
	if (v == false && throwOnError) {
		throw new CustomError(
			'Upload failed: The file is either too large (exceeds 5MB) or has an invalid file type. Please ensure your file is within the size limit and is of an accepted format'
		);
	}
	return v;
}
export const validImages = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
	'image/bmp',
	'image/avif'
];

export async function validatePicFile(file: File, throwOnError = true) {
	if (file instanceof File === false) return false;
	const size = await validateFileType(file);
	if (!size) {
		throw new CustomError('Oops! File too big (max 5MB). Try another one!');
	}
	const v = validateFileSize(file);
	if (!v) throw new CustomError('Oops! Wrong format. Try png, jpg, jpeg, etc.');
	return v;
}
export async function validateFileType(
	file: File,
	validType: MimeType | MimeType[] | 'image' = [
		'image/png',
		'image/jpeg',
		'image/webp',
		'image/gif',
		'image/bmp',
		'image/avif'
	]
) {
	const type = await fileTypeFromBlob(file);
	if (Array.isArray(validType)) {
		return validType.filter((v) => v === type?.mime).length > 0;
	}
	return type?.mime === validType || !!type?.mime.startsWith(validType);
}

export const CloudflareClient = new Cloudflare({
	apiToken: ZONE_PURGE
});

import { getUserIDFromLocalStorage } from '$lib/queries';
import { CustomError } from '$lib/queries/base/errors';
import { ImageTypes } from '$lib/queries/storage/constants';
import {
	getObjectPath,
	getPublicArtworkUrlSync,
	getPublicAvatarUrlSync,
	getPublicBookCoverUrlSync
} from '$lib/queries/storage/ObjectKey';
import { UploadSchema } from '$lib/schema/upload';
