import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test_accessibilite',
  globalSetup: './test_accessibilite/globalSetup.ts',
  globalTeardown: './test_accessibilite/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1550, height: 900 },
    headless: false,
  },
  webServer: {
    command: 'pnpm dev:back',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      CHIFFREMENT_SEL_DE_HASHAGE_1: 'd322524cb14933e9f8ab',
      NODE_ENV: 'test_accessibilite',
      NB_REQUETES_TRUST_PROXY: '0',
      URL_BASE_MSS: 'http://localhost:3000',
      NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE: '1000',
      NB_REQUETES_MAX_PAR_MINUTE: '1000',
      CACHE_CONTROL_FICHIERS_STATIQUES: 'public, max-age=0',
    },
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 10_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1550, height: 900 },
      },
    },
  ],
});
