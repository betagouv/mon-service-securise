import { expect, test } from '@playwright/test';
import { genereTokenPourCreationCompte } from './aideAuxTests.js';

test('La page creation-compte permet de créer un nouveau compte', async ({
  page,
}) => {
  const token = genereTokenPourCreationCompte();
  await page.goto(`/creation-compte?token=${token}`);
  await page.waitForURL(/creation-compte/);
  await page.click('text=Suivant');
  await page.click('.declencheur');
  await page.click('#RSSI');
  await page.click('body');
  await page.fill('#telephone', '0102030405');
  await page.selectOption('#estimation-nombre-services', '1_10');
  await page.click('text=Suivant');
  await page.click('#cguAcceptees');

  const [reponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/utilisateur')),
    page.click('text=Valider'),
  ]);

  // Après la création, l'app tente une reconnexion OIDC automatique. Le faux
  // adaptateur OIDC de test ne sait pas la mener à bien (il n'a pas d'email à
  // rejouer), donc on n'attend pas de redirection vers le tableau de bord
  expect(reponse.status()).toBe(200);
});
