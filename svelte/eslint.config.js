import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import js from '@eslint/js';

export default defineConfig(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        axios: 'readonly',
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-deprecated': 'error',
    },
    settings: {
      svelte: {
        // On veut parser de la donnée encodée en HTML depuis le back, on doit pouvoir utiliser l'instruction `@html`
        ignoreWarnings: ['svelte/no-at-html-tags'],
      },
    },
  }
);
