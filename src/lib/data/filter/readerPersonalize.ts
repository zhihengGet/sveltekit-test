/* eslint-disable prefer-const */
/* import useDebounce from 'lib/debounce';
import useStore from 'states/store';
 */
// eslint-disable-next-line prefer-const
let fontSize: { [s: string]: string } = { default: '1.1em' };
let fontSizeArray = [];
for (let x = 16; x <= 26; x += 2) {
	const label = x;
	fontSizeArray.push(x + 'px');
	fontSize[label] = label + 'px';
}

let lineHeight: { [x: string]: string } = {
	/* default: 'normal',
	small: '0.8',
	big: '1.2',
	large: '1.5',
	larger: '1.6' */
};
for (let x = 1.1; x < 10; x++) lineHeight[x] = x.toString();

let width: { [S: string]: string } = {};
for (let x = 50; x <= 100; x += 5) width[x + 'vw'] = x + 'vw';

/* let FontColor = () => {
	const updateReader = useStore.use.updateReader();
	const deb = useDebounce(500, (e) => updateReader({ color: e.target.value }));
	return '<input onChange={deb} type="color" />';
}; */

let nextChapter = { scroll: 'scroll', flip: 'flip' };

//let backgroundColor = [];
//let ContainerBackgroundColor = [];
let fontFamily = [
	'Intel',
	'Helvetica',
	'Verdana',
	'tahoma',
	'Lucia Sans',
	'Serif',
	'Sans-serif',
	'monospace',
	'cursive',
	'Fantasy',
	'Departure Mono'
] as const;
let fontFamilyObj: {
	[s in (typeof fontFamily)[number]]: (typeof fontFamily)[number];
} = {
	Intel: 'Intel',
	Helvetica: 'Intel',
	Verdana: 'Intel',
	tahoma: 'Intel',
	'Lucia Sans': 'Intel',
	Serif: 'Intel',
	'Sans-serif': 'Intel',
	monospace: 'Intel',
	cursive: 'Intel',
	Fantasy: 'Intel',
	'Departure Mono': 'Intel'
};

for (let x of fontFamily) {
	fontFamilyObj[x] = x;
}

const dark: Partial<readerTheme> = {
	fontSize: '1em',
	backgroundColor: 'rgb(2 8 2)',
	commentButton: 'green',
	containerBackgroundColor: '#010101',
	color: '#b1b1c7',
	fontFamily: 'Sans-serif',
	lineHeight: '1.9em',
	width: '60vw',
	darken: 'invert(1)'
};

const light = {
	...dark,
	backgroundColor: '#f1fffa',
	containerBackgroundColor: '#f1fffa',
	color: '#000000',
	darken: 'invert(0)'
};
const green = {
	...dark,
	backgroundColor: 'rgb(238 255 234)',
	containerBackgroundColor: '#4faa6c69',
	color: '#28262d',
	darken: 'invert(0)'
};
const relax = {
	...dark,
	backgroundColor: '#FEECE2',
	containerBackgroundColor: '#FEECE2',
	color: '#333d2e',
	darken: 'invert(0)'
};

const grassURL =
	'https://images.unsplash.com/photo-1598940603846-a1edd0ef2574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80';

const grassContainer =
	'https://images.unsplash.com/photo-1545709021-95c35d97a339?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80';
const oceanContainer =
	'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80';

const sURl =
	'https://images.unsplash.com/photo-1612152916525-a569e78ed905?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80';

const oUrl =
	'https://images.unsplash.com/photo-1467723992728-4b36889da56d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';

const grassland = {
	...dark,
	backgroundImage: `url(` + grassURL + ')',
	containerBackgroundImage: `url(${grassContainer})`,
	color: '#177ddc'
};

const ocean = {
	...dark,
	backgroundImage: 'url(' + oUrl + ')',
	containerBackgroundImage: `url(${oceanContainer})`,
	color: '#177ddc'
};

export type readerTheme = {
	fontSize: string;
	backgroundColor: string;
	commentButton: string;
	commentButtonOpacity: string; // opacity
	containerBackgroundColor?: string;
	containerBackgroundImage?: string;
	color: string;
	commentsOp: 1;
	skipVersions: false;
	theme: string;
	fontFamily: string;
	lineHeight: string;
	width: string;
	scroll: false; // infinite scroll
	darken: 'invert(0)' | 'invert(1)'; // enable dark reader?
};
export const darkReader = {
	dark: true,
	light: false,
	ocean: true,
	green: false,
	relax: false
};
export const theme = { dark, light, ocean, /* grassland,  */ green, relax };

export const options = {
	fontSize,
	fontFamily: fontFamilyObj,
	lineHeight,
	width
};

/* export { FontColor }; */
