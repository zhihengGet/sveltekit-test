import type { PostgresError } from 'postgres';

// all errors should be { message: }
export class CustomError extends Error {
	friendly_message = '';
	hints: string[] = ['Please refresh page'];
	constructor(
		dev_message: string,
		friendly: string = '',
		options?: { status: number }
	) {
		// Need to pass `options` as the second parameter to install the "cause" property.
		super(dev_message);
		this.friendly_message = friendly || dev_message;
		//FIXME allow setting error status
	}
	timestamp = new Date();
}
/**
 *
 * @param e any object
 * @returns {boolean} if this is an error
 */
export function isCustomError(e: unknown) {
	return e instanceof CustomError && e instanceof Error;
}

export const loginError = new CustomError('User not logged in', 'Please Login');
export const uploadError = new CustomError(
	'Failed to upload for unknown reasons...please refresh and retry again'
);
export const removeUploadError = new CustomError(
	'Failed to remove; Please Try again later'
);
export const uploadFormatError = new CustomError(
	'Failed to upload; Bad Format'
);
export const UsernameExistsError = new CustomError('Username Already Exists');
export const BookDoesNotExistsError = new CustomError(
	'Username Already Exists'
);
export const ImageExistsError = new CustomError('Filename Already Exists');

export const FileToHTMLFailed = new CustomError('Conversion Error');
export const MissingUserData = new CustomError('Missing user_data Error');

export function PostgrestToFriendly(e: PostgresError) {
	if (import.meta.env.DEV) {
		if (e.hint?.includes('unique')) {
			return 'Data already exists';
		}
		if (e.hint?.includes('security')) {
			return 'Unauthorized';
		}
	}
	return e.hint;
}
