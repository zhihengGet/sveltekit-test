export function formatNumber(n: number | null | undefined) {
	if (typeof n != 'number') return 0;

	if (n > 1e9) {
		return '+9B';
	}
	n = Math.floor(n);
	return Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 0,
		compactDisplay: 'short'
	}).format(n);
}
