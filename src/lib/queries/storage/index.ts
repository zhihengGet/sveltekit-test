import { UploadSchema } from '$lib/schema/upload';

export function validateUploadParams<T>(props: T) {
	const validate = UploadSchema.safeParse(props);
	if (validate.success === false) {
		throw validate.error.issues.map((v) => v.message).join(',');
	}
	return validate.data;
}
