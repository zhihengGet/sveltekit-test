export function parseRange(t: string) {
	const [a, b] = t.split(',');
	if (!a || !b) return [];
	return [parseInt(a.substring(1)), parseInt(b.substring(0, b?.length - 1))];
}
export function isRangeEqual(t: string | number[], t1: string | number[]) {
	if (Array.isArray(t)) {
		t = `[${t.toString()}]`;
	}
	if (Array.isArray(t1)) {
		t1 = `[${t1.toString()}]`;
	}

	return t == t1;
}
