import { Page } from '@playwright/test';

// Compte pré-provisionné par adaptateurPersistanceMemoireTestsAccessibilite.ts
// pour NODE_ENV=test_accessibilite (CGU déjà acceptées, entité déjà rattachée).
const EMAIL_UTILISATEUR_DE_TEST = 'utilisateur@mss.fr';

export const navigueSurPageConnectee = async (
  urlPage: string,
  page: Page,
  emailConnexion: string = EMAIL_UTILISATEUR_DE_TEST
) => {
  // Déconnecte l'utilisateur courant, pour éviter les conflits entre les exécutions.
  await page.goto('/connexion');

  const redirect = urlPage.replaceAll('/', '%2F');

  await page.context().addCookies([
    {
      name: 'AgentConnectInfo',
      domain: 'localhost',
      path: '/',
      value: `j:${JSON.stringify({
        state: 'FAKE_STATE',
        nonce: 'FAKE_NONCE',
        urlRedirection: redirect,
      })}`,
      expires: Math.floor(Date.now() / 1000) + 5 * 60_000,
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    },
  ]);

  await page.goto(`/oidc/apres-authentification?email=${emailConnexion}`);
  await page.waitForURL(urlPage, { waitUntil: 'networkidle' });
};

export const fermeModaleNouveauReferentielSiPresente = async (page: Page) => {
  const popinNouveauReferentielEstVisible = await page
    .locator(':text("Mise en place d’un nouveau référentiel de mesures")')
    .isVisible();
  if (popinNouveauReferentielEstVisible) {
    await page.click('text=Suivant');
    await page.click('text=Suivant');
    await page.click('text=J’ai compris 👍');
  }
};

export const fermeModaleVisiteGuideeSiPresente = async (page: Page) => {
  const bouton = page.getByRole('button', { name: 'Ignorer la visite guidée' });
  if (await bouton.isVisible()) await bouton.click();
};

export const remplirChamp = async (
  idInput: string,
  valeur: string,
  page: Page
) => {
  await page.locator(`input#${idInput}`).click();
  await page.keyboard.type(valeur);
  await page.keyboard.press('Tab');
};
