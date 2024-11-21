import { object, string, union, number, boolean } from 'zod';
import { genZodSchemaObject } from './zodPagination';
import { comment_schema } from '../commentSchema';

export const commentFilerZod = object({
	preview_session: string().uuid().nullish(),
	preview_id: string().uuid().nullish()
}).merge(comment_schema.partial());

export const commentPaginate = genZodSchemaObject(commentFilerZod);
