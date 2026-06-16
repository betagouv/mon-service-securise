import { rmSync } from 'fs';
import { chromium, FullConfig } from '@playwright/test';
import {
  captureDEcran,
  fermeModale2FASiPresente,
  fermeModaleVisiteGuideeSiPresente,
} from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

export default async (config: FullConfig) => {
  rmSync('test_accessibilite/rapport/violations.jsonl', { force: true });

  const urlBase = config.projects[0].use.baseURL;
  process.env.ACCESSIBILITE_DOSSIER_RAPPORT =
    config.webServer!.env!.ACCESSIBILITE_DOSSIER_RAPPORT;
  process.env.ACCESSIBILITE_DOSSIER_SCREENSHOTS =
    config.webServer!.env!.ACCESSIBILITE_DOSSIER_SCREENSHOTS;
  process.env.SECRET_JWT = config.webServer!.env!.SECRET_JWT;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const connexionUtilisateur = async () => {
    try {
      await page.context().addCookies([
        {
          name: 'AgentConnectInfo',
          domain: 'localhost',
          path: '/',
          value: `j:${JSON.stringify({ state: 'FAKE_STATE', nonce: 'FAKE_NONCE' })}`,
          expires: Math.floor(Date.now() / 1000) + 5 * 60_000,
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        },
      ]);
      await page.goto(
        `${urlBase}/oidc/apres-authentification?email=${donneesTestsAccessibilite.utilisateurLambda.email}`
      );
      await page.waitForURL(/tableauDeBord/);
      await fermeModale2FASiPresente(page);
      await fermeModaleVisiteGuideeSiPresente(page);
      await page.waitForLoadState('domcontentloaded');
    } catch (e) {
      await captureDEcran(page, `globalSetup-connexion-failure.png`);
      throw e;
    }
  };

  await connexionUtilisateur();
  await browser.close();
};
