module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jquery: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'prettier'],
  globals: { axios: 'readonly', moment: 'readonly' },
  parserOptions: { ecmaVersion: 2022 },
  ignorePatterns: [
    'public/bibliotheques/*.js',
    'public/composants-svelte/*.js',
    'public/composants-svelte/*.mjs',
    'dist/',
  ],
  plugins: ['mocha'],
  overrides: [
    {
      files: ['public/**/*.*js', 'migrations/**/*.*js'],
      rules: {
        'import/extensions': ['error', 'always'],
        'mocha/no-exclusive-tests': 'error',
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
      },
      settings: {
        'import/resolver': {
          node: { extensions: ['.mjs', '.js', '.json', '.ts'] },
        },
      },
    },
    {
      files: [
        'src/**/*.*ts',
        'consoleAdministration.ts',
        'creeUtilisateurDemo.ts',
      ],
      parser: '@typescript-eslint/parser',
      extends: [
        'airbnb-base',
        'prettier',
        'plugin:@typescript-eslint/recommended',
      ],
      settings: {
        'import/resolver': {
          node: { extensions: ['.mjs', '.js', '.json', '.ts'] },
        },
      },
      plugins: ['mocha', '@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/extensions': ['error', { ts: 'never' }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            caughtErrors: 'none',
          },
        ],
        'no-param-reassign': ['error', { props: false }],
        'no-return-assign': ['error', 'except-parens'],
      },
    },
    {
      files: ['src/erreurs.ts', 'src/modeles/journalMSS/erreurs.ts'],
      rules: {
        'max-classes-per-file': ['off'],
      },
    },
  ],
};
