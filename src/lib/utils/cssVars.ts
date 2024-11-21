export const cssVars = (styles: object) => {
	return Object.entries(styles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
};
