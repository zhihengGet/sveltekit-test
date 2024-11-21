/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// my-preset.ts
import type { Preset } from 'unocss';

export const bookPreset: Preset = {
	name: 'my-preset',
	rules: [
		[
			/glass-(\d+)/,
			(m) => {
				return {
					'backdrop-filter': 'blur(21px) saturate(180%)',
					'-webkit-backdrop-filter': 'blur(21px) saturate(180%)',
					'background-color': 'rgba(139, 87, 42, 0.75)',
					'border-radius': '5px'
					//border: '0.1px solid rgba(255, 255, 255, 0.125)'
				};
			}
		],
		[
			/iconify/,
			() => {
				return {
					display: 'inline-block',
					'vertical-align': 'middle',
					'font-size': '20px'
				};
			}
		],
		[
			/book_(\S+)_(\w{2})$/,
			(matches) => {
				//book_sizing_md
				//book_width_md
				//book_height_md
				// md sm lg
				console.log('book size matched regex', matches);
				const [matched, css, type] = matches as [
					string,
					'sizing' | 'width' | 'height',
					'sm' | 'md' | 'lg'
				];
				const size = {
					sm: [120, 90],
					md: [120, 90],
					lg: [240, 180]
				};

				if (css == 'sizing') {
					return {
						width: size[type][1] + 'px',
						height: size[type][0] + 'px'
					};
				}

				if (css == 'width') {
					return { width: size[type][1] + 'px' };
				}
				if (css == 'height') {
					return { height: size[type][0] + 'px' };
				}
			},
			{ autocomplete: 'book_(sizing|width|height)_(sm|md|lg)' }
		],
		['webFont', { 'font-family': `'inter', sans-serif;` }],
		[
			'book-ratio',
			{ 'aspect-ratio': ' 3 / 4' },
			{ autocomplete: 'book-(ratio)' }
		],
		['debugcss', { 'background-color': 'red' }]
		/* 	[
			'standout',
			{
				color: 'white',
				filter: 'drop-shadow(0.05em .05em orange)',
				'mix-blend-mode': 'difference'
			}
		] */
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},

		colors: {
			magnum: {
				'50': '#fff9ed',
				'100': '#fef2d6',
				'200': '#fce0ac',
				'300': '#f9c978',
				'400': '#f7b155',
				'500': '#f38d1c',
				'600': '#e47312',
				'700': '#bd5711',
				'800': '#964516',
				'900': '#793a15',
				'950': '#411c09'
			},
			border: 'hsla(var(--border))',
			input: 'hsla(var(--input))',
			ring: 'hsla(var(--ring))',
			background: 'hsla(var(--background))',
			foreground: 'hsla(var(--foreground))',
			primary: {
				DEFAULT: 'hsla(var(--primary))',
				foreground: 'hsla(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsla(var(--secondary))',
				foreground: 'hsla(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsla(var(--destructive))',
				foreground: 'hsla(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsla(var(--muted))',
				foreground: 'hsla(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsla(var(--accent))',
				foreground: 'hsla(var(--accent-foreground))'
			},
			popover: {
				DEFAULT: 'hsla(var(--popover))',
				foreground: 'hsla(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsla(var(--card))',
				foreground: 'hsla(var(--card-foreground))'
			}
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		// ...
		boxShadow: {
			sm: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
			small:
				'0px 0px 5px 0px rgb(0 0 0 / 0.02), 0px 2px 10px 0px rgb(0 0 0 / 0.06), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
			medium:
				'0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
			large:
				'0px 0px 30px 0px rgb(0 0 0 / 0.04), 0px 30px 60px 0px rgb(0 0 0 / 0.12), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
			gentle: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
			x: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
		}
	},
	shortcuts: { book: 'aspect-[3/4]' }
};
