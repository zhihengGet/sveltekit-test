/* import preprocess from 'svelte-preprocess'; */
//import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocessMeltUI } from "@melt-ui/pp";
import adapter from "@sveltejs/adapter-cloudflare";
/** @type {import('@sveltejs/kit').Config}*/
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    vitePreprocess({ script: true }),
    preprocessMeltUI(),

    /* 	preprocess({
			postcss: false
		}) */
  ],
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
      platformProxy: {
        //configPath: './wrangler.toml',
        //environment: 'dev',
        experimentalJsonConfig: false,
        persist: true,
      },
    }),
    alias: {
      $components: "src/lib/components",
      $packages: "../../packages/*",
    },
    csp: {
      directives: {
        "script-src": [
          "self",
          "nonce-u0UXDSOt8TKMOweDXnwtSg==",
          "https://challenges.cloudflare.com",
          "https://js.stripe.com/v3/",
          "https://accounts.google.com/gsi/client",
        ],
        "font-src": [
          "self",
          "https://cdnjs.cloudflare.com/",
          "https://fonts.googleapis.com/",
          "https://fonts.gstatic.com",
          "data:",
          "https:",
        ],
        "child-src": ["https:", "self"],
        "frame-src": [
          "https://*.cloudflare.com",
          "self",
          "https://js.stripe.com/v3/",
          "https://accounts.google.com/",
          "https://accounts.google.com/gsi/",
        ],
        "style-src": [
          "self",
          "unsafe-inline",
          "https://accounts.google.com/gsi/style",
          //cloudflare turnstile
          "https:",
        ],
        "style-src-elem": [
          "self",
          "https://accounts.google.com/gsi/style",
          "unsafe-inline",
          //cloudflare turnstile
          "https://cdnjs.cloudflare.com/",
          "https://fonts.googleapis.com/",
        ],
      },
      mode: "auto",
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // ignore deliberate link to shiny 404 page
        console.error("error encounter", path, message);
        return "ignore";
        // otherwise fail the build
        throw new Error(message);
      },
    },
  },

  // compilerOptions: { dev: true },
  // vitePlugin: { inspector: false },
  shadcn: {
    componentPath: "./src/lib/components/ui",
  },
};
export default config;
