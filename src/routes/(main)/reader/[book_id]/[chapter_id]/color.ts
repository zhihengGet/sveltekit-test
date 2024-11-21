import Color from 'colorjs.io';
export function color(c: string | null) {
	const color = new Color(c ?? 'white');

	return color;
}
