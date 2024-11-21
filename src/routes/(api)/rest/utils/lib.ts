export function lastN(arr: any[], n: number) {
	if (arr.length > n) {
		return arr.slice(arr.length - n);
	}
	return arr;
}
