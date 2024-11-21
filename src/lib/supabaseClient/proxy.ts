// Wraps fetch with the provided handler
type props = {
	fetch: typeof fetch;
	args: Parameters<typeof fetch>;
};
export const handleFetch = (
	fetchHandler: (input: {
		fetch: typeof fetch;
		args: Parameters<typeof fetch>;
	}) => Promise<Response>
): void => {
	proxyFetch(fetchHandler);
};

//  calls svelte fetch for cached res then our fetch
export const proxyFetch = (instrument: (fetch: props) => Promise<Response>) => {
	// svelte patched
	const native = window.fetchProxy;

	window.fetchProxy = async (...args: Parameters<typeof fetch>) => {
		return await instrument({ fetch: native, args });
	};
};
