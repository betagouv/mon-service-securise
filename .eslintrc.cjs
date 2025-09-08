const vitest = require('@vitest/eslint-plugin');

module.exports = {
  env: { browser: true, jquery: true },
  extends: ['airbnb-base', 'prettier', 'plugin:@vitest/legacy-recommended'],
  globals: {
    axios: 'readonly',
    ...vitest.environments.env.globals,
  },
  parserOptions: { ecmaVersion: 2022 },
  plugins: ['@vitest'],
  ignorePatterns: [
    'public/bibliotheques/*.js',
    'public/composants-svelte/*.js',
    'public/composants-svelte/*.mjs',
    'dist/',
  ],
  rules: {
    'no-param-reassign': ['error', { props: false }],
    'no-return-assign': ['error', 'except-parens'],
    'no-underscore-dangle': ['error', { allow: ['_paq', '_mtm'] }],
    'no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // Les exports par défaut empêchent les LSP de nos IDE de suivre les définitions & références dans le code
    'import/prefer-default-export': 'off',
    '@vitest/expect-expect': 'off',
  },
  settings: { 'import/resolver': { typescript: {} } },
  overrides: [
    {
      files: ['test*/**/*.*js'],
      rules: {
        'no-new': ['off'],
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: true },
        ],
        'import/extensions': ['off'],
      },
    },
    {
      // Dans le code du backend on est dans le monde "nodejs qui exécute de l'ESM".
      // Donc :
      //  - l'extention est OBLIGATOIRE quand on importe un fichier
      //  - les .ts N'EXISTENT PAS au runtime
      // Donc on veut interdire l'import de .ts dans nos fichiers .js.
      // Cf. https://www.typescriptlang.org/docs/handbook/modules/theory.html pour comprendre qu'il faut toujours importer le fichier .js
      files: ['src/**/*.js', '*.js'],
      rules: { 'import/extensions': ['error', { js: 'always' }] },
    },
    {
      // Ici on est dans le code envoyé au navigateur, pas dans le backend, donc on autorise .js et .mjs
      files: ['public/**/*.*js'],
      rules: {
        'import/extensions': ['error', { js: 'always', mjs: 'always' }],
      },
    },
    {
      files: ['src/erreurs.js', 'src/modeles/journalMSS/erreurs.js'],
      rules: { 'max-classes-per-file': ['off'] },
    },
    {
      files: ['src/**/*.*ts', '*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'airbnb-base',
        'prettier',
        'plugin:@typescript-eslint/recommended',
      ],
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.mjs', '.js', '.json', '.ts'],
          },
        },
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/extensions': ['off'],
        // Les exports par défaut empêchent les LSP de nos IDE de suivre les définitions & références dans le code
        'import/prefer-default-export': 'off',
        'lines-between-class-members': 'off',
      },
    },
    {
      // Nous voulons que nos tests en TS référencent directement leur PROD en TS : nous ne sommes PAS dans le monde nodejs.
      files: ['*.spec.ts'],
      rules: { 'import/extensions': ['off'] },
    },
  ],
};
