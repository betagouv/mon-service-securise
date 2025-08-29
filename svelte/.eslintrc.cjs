module.exports = {
  root: true, // Pour qu'eslint n'utilise que ce fichier de config, et ignore celui à la racine de MSS
  extends: ['plugin:svelte/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'svelte/tsconfig.json',
    extraFileExtensions: ['.svelte'], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: { parser: '@typescript-eslint/parser' },
    },
  ],
  settings: {
    svelte: {
      // On veut parser de la donnée encodée en HTML depuis le back, on doit pouvoir utiliser l'instruction `@html`
      ignoreWarnings: ['svelte/no-at-html-tags'],
    },
  },
};
