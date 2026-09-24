// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**',
      'test_accessibilite/**',
      'test_integration/**',
    ],
    env: {
      TZ: 'UTC',
    },
    alias: {
      '@sentry/node': fileURLToPath(
        new URL('./test/mocks/sentryNodeVide.ts', import.meta.url)
      ),
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'backend',
          include: ['test/**/*.spec.{js,ts}'],
          isolate: false,
        },
      },
      {
        extends: true,
        test: {
          name: 'autres',
          exclude: ['test/**'],
        },
      },
    ],
  },
});
