import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { glob } from 'glob';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() })],
  root: './lib',
  build: {
    // on build vers le dossier de fichiers statiques /public pour servir les bundles depuis le pug
    outDir: resolve(__dirname, '../public/composants-svelte'),
    lib: {
      entry: glob
        .sync(resolve(__dirname, './lib/*.ts'))
        .filter((file) => !file.includes('.d.ts')),
      fileName: (_, entryname) => `${entryname}.js`,
      formats: ['es'],
    },
    cssCodeSplit: true,
    emptyOutDir: true,
  },
});
