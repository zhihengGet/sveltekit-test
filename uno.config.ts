// uno.config.ts
import { shadcnColorPreset } from './shadcn-preset';
import {
	defineConfig,
	presetIcons,
	presetWind,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss';
import presetAnimations from 'unocss-preset-animations';
import { presetShadcn } from 'unocss-preset-shadcn';
import { bookPreset } from './bookPreset';
import { presetWebFonts } from 'unocss';
import { twConfig } from './tailwind';

const content = defineConfig({
	content: {
		pipeline: {
			include: [
				// the default
				/\.(svelte|html)($|\?)/,
				// include js/ts files
				'./src/lib/components/ui/**/*.ts'
			]
			// exclude files
			//	exclude: ['src/**/+{page,layout}.{js,ts}',"src/"]
		}
	}
});
export const CSSConfig = defineConfig({
	presets: [
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
				'font-size': '20px'
			},
			autoInstall: false
		}),
		presetWebFonts({
			/* options */
		}),
		presetWind({ dark: 'class' }),
		bookPreset,
		presetAnimations({ duration: 250 })
		/* shadcnColorPreset */
		/* presetShadcn({
			color: 'green',
			radius: 0.7
		}) */
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
			border: 'hsl(var(--border) / <alpha-value>)',
			input: 'hsl(var(--input) / <alpha-value>)',
			ring: 'hsl(var(--ring) / <alpha-value>)',
			background: 'hsl(var(--background) / <alpha-value>)',
			foreground: 'hsl(var(--foreground) / <alpha-value>)',
			primary: {
				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
			},
			card: {
				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
			},
			sidebar: {
				DEFAULT: 'hsl(var(--sidebar-background))',
				foreground: 'hsl(var(--sidebar-foreground))',
				primary: 'hsl(var(--sidebar-primary))',
				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
				accent: 'hsl(var(--sidebar-accent))',
				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
				border: 'hsl(var(--sidebar-border))',
				ring: 'hsl(var(--sidebar-ring))'
			}
		},
		borderRadius: {
			xl: 'calc(var(--radius) + 4px)',
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--bits-accordion-content-height)' }
			},
			'accordion-up': {
				from: { height: 'var(--bits-accordion-content-height)' },
				to: { height: '0' }
			},
			'caret-blink': {
				'0%,70%,100%': { opacity: '1' },
				'20%,50%': { opacity: '0' }
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'caret-blink': 'caret-blink 1.25s ease-out infinite'
		}
	},
	content: content.content,
	transformers: [transformerDirectives(), transformerVariantGroup()]
});
