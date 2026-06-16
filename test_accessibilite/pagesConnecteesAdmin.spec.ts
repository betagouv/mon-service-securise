import { test } from '@playwright/test';
import { CheckIntermediaire, navigueSurPageConnectee } from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

test(`La page qui liste les utilisateurs du périmètre d'un admin n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const clicSurBouton = async (labelBouton: string) => {
    await page.getByRole('button', { name: labelBouton }).first().click();
  };

  const checkIntermediaire = new CheckIntermediaire('admin-utilisateurs');

  await navigueSurPageConnectee(
    '/admin/utilisateurs',
    page,
    donneesTestsAccessibilite.utilisateurAdmin.email
  );

  await checkIntermediaire.valideEtape(page);

  async function verifieTiroirAttributionRole() {
    await clicSurBouton('Gérer les accès aux services');

    await page.waitForSelector('#tiroir.ouvert');
    await page.waitForLoadState('networkidle');

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Tout sélectionner');
    await clicSurBouton('Attribuer un rôle commun');

    await checkIntermediaire.valideEtape(page);

    await page
      .locator('#tiroir dsfr-select')
      .first()
      .evaluate((el) => {
        el.dispatchEvent(
          new CustomEvent('valuechanged', { detail: 'LECTURE', bubbles: true })
        );
      });

    await clicSurBouton('Enregistrer toutes les modifications');

    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/utilisateurs') &&
        r.url().includes('/roles') &&
        r.status() === 200
    );
  }

  async function verifieTiroirRetraitRole() {
    await clicSurBouton('Gérer les accès aux services');

    await page.waitForSelector('#tiroir.ouvert');
    await page.waitForLoadState('networkidle');

    await clicSurBouton('Tout sélectionner');
    await clicSurBouton('Retirer');

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Retirer du service');

    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/utilisateurs') &&
        r.url().includes('/roles') &&
        r.status() === 200
    );
  }

  await verifieTiroirAttributionRole();
  await verifieTiroirRetraitRole();
});
