export const useMemo = (fn) => {
	const data = $derived(fn());
	return () => data;
};
