import type {
	bookWithUserInfo,
	commentJoined,
	user_book_data,
	user_comment_data
} from '$lib/types';
import { QueryClient } from '@tanstack/svelte-query';
type user = user_book_data | user_comment_data;
type A = bookWithUserInfo | commentJoined;
type props<T> = {
	client: QueryClient;
	new_user_data: T;
	key: string[];
	table_name: string;
	isEqual: (old: A, new_: T) => boolean;
	sameEntityEqual?: (old: T, new_: T) => boolean;
};

export function user_data_cache_sync<T extends user>({
	client,
	new_user_data,
	key,
	table_name,
	sameEntityEqual = () => false, // without id, we don't know if
	isEqual
}: props<T>) {
	client.setQueriesData(
		{
			predicate: (query) => {
				for (let x of key) {
					if (query.queryKey.includes(x) == false) return false;
				}
				return true;
			}
		},
		(old: any | undefined) => {
			if (!old) return;
			if (old) {
				// {...book, user_book_data:[]}[]
				// {user_book_data}
				// {..book,user_bookdata:[]}
				if (Array.isArray(old)) {
					for (const item of old) {
						if (isEqual(item, new_user_data)) {
							item[table_name] = [new_user_data];
							return old;
						}
					}
				} else {
					if (old[table_name]) {
						if (isEqual(old, new_user_data)) {
							old[table_name] = [new_user_data];
							return old;
						}
					} else if (sameEntityEqual(old, new_user_data)) {
						return { ...old, ...new_user_data };
					}
				}
			}
			//console.log('update comment cache ', data);
			return old;
		}
	);
}
