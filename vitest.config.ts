// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    isolate: false,
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
  },
});
