import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test_accessibilite',
  globalSetup: './test_accessibilite/globalSetup.ts',
  globalTeardown: './test_accessibilite/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1550, height: 900 },
  },
  webServer: {
    command: 'pnpm build:front && pnpm dev:back',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      EMAIL_CONNEXION: 'test@fia1.fr',
      DOSSIER_RAPPORT: 'test_accessibilite/rapport',
      DOSSIER_SCREENSHOTS: 'test_accessibilite/screenshots',
      CHIFFREMENT_SEL_DE_HASHAGE_1: 'd322524cb14933e9f8ab',
      NODE_ENV: 'test_accessibilite',
      NB_REQUETES_TRUST_PROXY: '0',
      URL_BASE_MSS: 'http://localhost:3000',
      NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE: '1000',
      NB_REQUETES_MAX_PAR_MINUTE: '1000',
      CACHE_CONTROL_FICHIERS_STATIQUES: 'public, max-age=0',
      AVEC_JOURNAL_MEMOIRE_QUI_LOG_CONSOLE: 'false',
      SECRET_COOKIE: 'monsupersecretpassecret',
      SECRET_JWT: 'monsupersecretpassecret',
      AVEC_JOURNAL_EN_MEMOIRE: 'true',
      STATISTIQUES_ID_DASHBOARD_METABASE:
        '986508c1-4464-4168-abdf-88c053dd1515',
      METABASE_ID_QUESTION_NB_SERVICES: '36',
      METABASE_ID_QUESTION_NB_UTILISATEURS: '35',
      METABASE_ID_QUESTION_NB_VULNERABILITES: '37',
      CRISP_ID_ARTICLE_DEVENIR_AMBASSADEUR:
        '8d00dbbe-245e-41a6-a4ba-666d653e4547',
      CRISP_ID_ARTICLE_FAIRE_CONNAITRE: 'e2eebb6e-46f7-4c24-bba2-0dd3274ae024',
      CRISP_ID_ARTICLE_PROMOUVOIR: 'cc1e1ff4-5dae-41ff-a40f-4e4b979741aa',
      CRISP_ID_ARTICLE_ROADMAP: '107f8554-ccea-4fe3-950c-2c07a106811a',
      CRISP_ID_CATEGORIE_BLOG: '8424d4d8-aa79-46fc-bef9-afd0287df0aa',
      FEATURE_FLAG_AVEC_RISQUES_V2: 'true',
    },
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 15_000,
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
