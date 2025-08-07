import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig, createLogger } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { glob } from 'glob';

const loggerPersonnalise = createLogger();
const loggerWarnOnce = loggerPersonnalise.warnOnce;

loggerPersonnalise.warnOnce = (msg, options) => {
  const regexp =
    /assets\/.* referenced in .* didn't resolve at build time, it will remain unchanged to be resolved at runtime/;
  if (msg.match(regexp)) return;

  loggerWarnOnce(msg, options);
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({ preprocess: vitePreprocess() }),
    sentryVitePlugin({
      disable:
        !process.env.SENTRY_AUTH_TOKEN || process.env.NODE_ENV !== 'production',
      project: process.env.SENTRY_PROJET,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  root: './lib',
  build: {
    // on build vers le dossier de fichiers statiques /public pour servir les bundles depuis le pug
    outDir: resolve(__dirname, '../public/composants-svelte'),
    lib: {
      entry: glob
        .sync(resolve(__dirname, './lib/**/*.ts'))
        .filter((file) => !file.includes('.d.ts')),
      fileName: (_, entryname) => `${entryname}.js`,
      formats: ['es'],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': "'production'",
  },
  customLogger: loggerPersonnalise,
});
