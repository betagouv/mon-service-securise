const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');
const vitest = require('@vitest/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        axios: 'readonly',
        ...vitest.environments.env.globals,
      },

      ecmaVersion: 2022,
      parserOptions: {},
    },

    extends: compat.extends(
      'airbnb-base',
      'prettier',
      'plugin:@vitest/legacy-recommended'
    ),

    plugins: {
      '@vitest': vitest,
    },

    rules: {
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],

      'no-return-assign': ['error', 'except-parens'],

      'no-underscore-dangle': [
        'error',
        {
          allow: ['_paq', '_mtm'],
        },
      ],

      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'import/prefer-default-export': 'off',
      '@vitest/expect-expect': 'off',
      '@vitest/no-conditional-expect': 'off',
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  globalIgnores([
    'public/bibliotheques/*.js',
    'public/composants-svelte/*.js',
    'public/composants-svelte/*.mjs',
    '**/dist/',
    'svelte/**',
    'eslint.config.cjs',
  ]),
  {
    files: ['test*/**/*.*js'],

    rules: {
      'no-new': ['off'],

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],

      'import/extensions': ['off'],
    },
  },
  {
    files: ['src/**/*.js', '**/*.js'],

    rules: {
      'import/extensions': [
        'error',
        {
          js: 'always',
        },
      ],
    },
  },
  {
    files: ['public/**/*.*js'],

    rules: {
      'import/extensions': [
        'error',
        {
          js: 'always',
          mjs: 'always',
        },
      ],
    },
  },
  {
    files: ['src/erreurs.js', 'src/modeles/journalMSS/erreurs.js'],

    rules: {
      'max-classes-per-file': ['off'],
    },
  },
  {
    files: ['src/**/*.*ts', '**/*.ts'],

    languageOptions: {
      parser: tsParser,
    },

    extends: compat.extends(
      'airbnb-base',
      'prettier',
      'plugin:@typescript-eslint/recommended'
    ),

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.mjs', '.js', '.json', '.ts'],
        },
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/extensions': ['off'],
      'import/prefer-default-export': 'off',
      'lines-between-class-members': 'off',
      'no-useless-constructor': 'off',

      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['requete', 'reponse'],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],

    rules: {
      'import/extensions': ['off'],
    },
  },
  {
    files: ['test_accessibilite/**/*.*ts', 'playwright.config.ts'],

    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },
]);
