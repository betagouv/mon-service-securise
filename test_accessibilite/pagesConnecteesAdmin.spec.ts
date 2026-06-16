import { test } from '@playwright/test';
import { CheckIntermediaire, navigueSurPageConnectee } from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

test(`La page qui liste les utilisateurs du périmètre d'un admin n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('admin-utilisateurs');

  await navigueSurPageConnectee(
    '/admin/utilisateurs',
    page,
    donneesTestsAccessibilite.utilisateurAdmin.email
  );

  await checkIntermediaire.valideEtape(page);

  await page
    .getByRole('button', { name: 'Gérer les accès aux services' })
    .first()
    .click();
  await page.waitForSelector('#tiroir.ouvert');
  await page.waitForLoadState('networkidle');

  await checkIntermediaire.valideEtape(page);

  await page.getByRole('button', { name: 'Tout sélectionner' }).click();
  await page.getByRole('button', { name: 'Attribuer un rôle commun' }).click();

  await checkIntermediaire.valideEtape(page);

  await page
    .locator('#tiroir dsfr-select')
    .first()
    .evaluate((el) => {
      el.dispatchEvent(
        new CustomEvent('valuechanged', { detail: 'LECTURE', bubbles: true })
      );
    });

  await page
    .getByRole('button', { name: 'Enregistrer toutes les modifications' })
    .click();

  await page.waitForResponse(
    (r) =>
      r.url().includes('/api/admin/utilisateurs') &&
      r.url().includes('/roles') &&
      r.status() === 200
  );
});
