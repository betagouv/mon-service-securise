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
  overrides: [
    {
      files: ['public/**/*.*js'],
      rules: { 'import/extensions': ['error', 'always'] },
    },
    {
      files: ['test*/**/*.*js'],
      rules: {
        'no-new': ['off'],
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: true },
        ],
        'import/extensions': ['error', { mjs: 'always' }],
      },
    },
    {
      files: ['src/erreurs.js', 'src/modeles/journalMSS/erreurs.js'],
      rules: { 'max-classes-per-file': ['off'] },
    },
  ],
};
