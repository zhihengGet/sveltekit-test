import { omit, remove, set } from 'lodash-es';
import type { ZodSchema } from 'zod';

export function zodClean(schema: ZodSchema, data: any) {
	const t = schema.safeParse(data);
	if (t.success) return t.data;
	for (let e of t.error?.issues || []) {
		data = omit(data, e.path.join('.'));
	}
	const tt = schema.safeParse(data);
	if (tt.error) {
		console.warn('unable to clean, save as it is');
		return data;
	}
	return tt.data;
}
