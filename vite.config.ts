import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import UnoCSS from 'unocss/vite';
import { CSSConfig } from './uno.config';
import viteRemove from 'unplugin-remove/vite';

export default defineConfig({
	plugins: [
		UnoCSS(CSSConfig),
		sveltekit(),
		viteRemove({
			exclude: [
				'src/routes/(api)/**',
				'**/preprocessChapter.ts',
				'**/*.server.ts'
			]
		})
	],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: [searchForWorkspaceRoot(process.cwd())]
		}
	},
	/* 	css: {
		transformer: 'lightningcss'
	}, */
	/* esbuild: {
		drop: ['console', 'debugger']
	}, */
	// build: {
	// 	rollupOptions: {
	// 		external: ['cloudflare:workers'],
	// 		treeshake: 'recommended'
	// 	}
	// },
	ssr: {
		external: ['cloudflare:workers']
	},
	test: {
		include: ['./tests/**/*.ts']
	}
});
