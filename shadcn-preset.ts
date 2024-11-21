/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Theme } from 'unocss/preset-mini';

/* allose css variable and opacity  */
const dark = `dark (divider)
--background: 224 71% 4%;
--foreground: 213 31% 91%;
--muted: 223 47% 11%;
--muted-foreground: 215.4 16.3% 56.9%;
--accent: 216 34% 17%;
--accent-foreground: 210 40% 98%;
--popover: 224 71% 4%;
--popover-foreground: 215 20.2% 65.1%;
--border: 216 34% 17%;
--input: 216 34% 17%;
--card: 224 71% 4%;
--card-foreground: 213 31% 91%;
--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 1.2%;
--secondary: 222.2 47.4% 11.2%;
--secondary-foreground: 210 40% 98%;
--destructive: 359 51% 48%;
--destructive-foreground: 210 40% 98%;
--ring: 216 34% 17%;
--radius: 0.5rem;`;
const a = `
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 92% 38%;
    --destructive-foreground: 210 40% 98%;
    --ring: 215 20.2% 65.1%;
    --radius: 0.5rem;
    ${dark}
    `;

const b = a.split('\n');
//console.log(b);
const themeColors: { [s in string]: { dark?: string[]; light?: string[] } } =
	{};

const palette: { [s in string]: Theme } = { dark: { colors: {} } };
let isDark = false;
for (const x of b) {
	if (x.trim() !== '') {
		if (x.indexOf('dark') > -1) {
			isDark = !isDark;
			continue;
		}
		//@ts-ignore
		const hsla = x.split(':')[1].split(';')[0];
		//@ts-ignore
		const name = x.split(':')[0].trim().substring(2);
		const theme = isDark ? 'dark' : 'light';
		//console.log(name, hsla);
		if (name in themeColors) {
			//@ts-ignore
			themeColors[name][theme] = hsla.trim().split(' ');
			//@ts-ignore
			palette[theme].colors[name] = `hsl(${hsla})`;
		} else {
			themeColors[name] = {
				//@ts-ignore
				[theme]: hsla.trim().split(' ')
			};
			palette[theme] = { colors: {} };
		}
	}
}
import presetTheme from 'unocss-preset-theme';

import presetPalette from 'unocss-preset-palette';

/* generate shadcn colors */
export const shadcnColorPreset =
	/* presetPalette({
		// hsl | rgb
		colorFormat: 'hsl',
		themeColors: themeColors,
		cssVarName: (v) => v,
		useOpacityVariable: true
	}) || */
	presetTheme({
		// hsl | rgb
		theme: { palette }
	});
