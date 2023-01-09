module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jquery: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    axios: 'readonly',
    Chart: 'readonly',
    ChartDataLabels: 'readonly',
    html2canvas: 'readonly',
    jspdf: 'readonly',
    moment: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ['mocha'],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'function-call-argument-newline': 'off',
    'function-paren-newline': 'off',
    'mocha/no-exclusive-tests': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-promise-executor-return': 'off',
    'no-restricted-exports': 'off',
    'no-return-assign': ['error', 'except-parens'],
    'no-underscore-dangle': ['error', { allow: ['_paq'] }],
    'no-unused-vars': ['error', {
      args: 'all',
      argsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    }],
    'object-curly-newline': ['error', {
      ObjectExpression: { consistent: true },
      ObjectPattern: { consistent: true },
      ImportDeclaration: { consistent: true },
      ExportDeclaration: { consistent: true },
    }],
  },
  overrides: [{
    files: ['public/**/*.*js'],
    rules: { 'import/extensions': ['error', 'always'] },
  }, {
    files: ['test*/**/*.*js'],
    rules: {
      'no-new': ['off'],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/extensions': ['error', { mjs: 'always' }],
    },
  }, {
    files: ['src/erreurs.js', 'src/modeles/journalMSS/erreurs.js'],
    rules: { 'max-classes-per-file': ['off'] },
  }],
};
