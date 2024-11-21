/* eslint-disable prefer-const */
// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production

import type { PageLoad } from './$types';
export const csr = true;
export const ssr = false;
export const load: PageLoad = async ({ url, depends }) => {
	depends('book:showcase');
	/*	let temp = url.searchParams.get('filter');
	let search = deserializeFilter(temp) || defaultParams;
	console.log('search updated', search.filter, page);
	//TODO add client validation for queries
	 	const data = await queryClient
		.fetchQuery({
			queryKey: [search.filter, search.paginate],
			staleTime: 1000 * 60, //1min
			queryFn: async () =>
				await getBooks(search).catch((e) => {
					return { books: [], count: 0 };
				})
		})
		.catch((v) => {
			return { books: [], count: 0 };
		});
	console.log('🚀 ~ file: root +page.ts:14 ~ load ~ books:', data);
	if (typeof data === 'number' || Array.isArray(data)) {
		//NOTE make ts happy
		return { books: [], count: 0 };
	}

	return { books: data?.books, count: data?.count }; */
};
