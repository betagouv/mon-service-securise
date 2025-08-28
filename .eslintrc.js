const vitest = require('@vitest/eslint-plugin');

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jquery: true,
  },
  extends: ['airbnb-base', 'prettier', 'plugin:@vitest/legacy-recommended'],
  globals: {
    axios: 'readonly',
    moment: 'readonly',
    ...vitest.environments.env.globals,
  },
  parserOptions: {
    ecmaVersion: 2022,
  },
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
    '@vitest/expect-expect': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['public/**/*.*js'],
      rules: { 'import/extensions': ['error', 'always'] },
    },
    {
      files: ['admin/**/*.*js'],
    },
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
        'import/extensions': ['error', { ts: 'never' }],
      },
    },
  ],
};
