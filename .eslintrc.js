module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jquery: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    axios: 'readonly',
    moment: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2022,
  },
  ignorePatterns: [
    'public/bibliotheques/*.js',
    'public/composants-svelte/*.js',
    'public/composants-svelte/*.mjs',
    'dist/',
  ],
  plugins: ['mocha'],
  rules: {
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
      // Lorsque l'on importe des modules générés depuis du `TypeScript`,
      // `eslint` est confus et demande d'ajouter une extension `.ts` ce qui empêche l'import du code généré.
      files: ['src/**/*.js'],
      rules: {
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
      plugins: ['mocha', '@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/extensions': ['error', { ts: 'never' }],
      },
    },
  ],
};
