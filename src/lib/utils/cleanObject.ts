export function cleanObject<T>(any: T) {
	for (let x in any) {
		if (any[x] === null || any[x] === undefined) {
			delete any[x];
		}
	}
	return any;
}
