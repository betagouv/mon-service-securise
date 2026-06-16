import { test } from '@playwright/test';
import {
  CheckIntermediaire,
  clicSurBouton,
  navigueSurPageConnectee,
  remplirChamp,
} from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { utilisateurAdmin, utilisateurLambda, utilisateurSuperviseur } =
  donneesTestsAccessibilite;

test(`La page qui liste les utilisateurs du périmètre d'un admin n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('admin-utilisateurs');

  await navigueSurPageConnectee(
    '/admin/utilisateurs',
    page,
    utilisateurAdmin.email
  );

  await checkIntermediaire.valideEtape(page);

  async function verifieTiroirAttributionRole() {
    await clicSurBouton('Gérer les accès aux services', page);

    await page.waitForSelector('#tiroir.ouvert');
    await page.waitForLoadState('networkidle');

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Tout sélectionner', page);
    await clicSurBouton('Attribuer un rôle commun', page);

    await checkIntermediaire.valideEtape(page);

    await page
      .locator('#tiroir dsfr-select')
      .first()
      .evaluate((el) => {
        el.dispatchEvent(
          new CustomEvent('valuechanged', { detail: 'LECTURE', bubbles: true })
        );
      });

    await clicSurBouton('Enregistrer toutes les modifications', page);

    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/utilisateurs') &&
        r.url().includes('/roles') &&
        r.status() === 200
    );
  }

  async function verifieTiroirRetraitRole() {
    await clicSurBouton('Gérer les accès aux services', page);

    await page.waitForSelector('#tiroir.ouvert');
    await page.waitForLoadState('networkidle');

    await clicSurBouton('Tout sélectionner', page);
    await clicSurBouton('Retirer', page);

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Retirer du service', page);

    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/utilisateurs') &&
        r.url().includes('/roles') &&
        r.status() === 200
    );
  }

  async function verifieTiroirNommeAdmin() {
    await clicSurBouton("Nommer en tant qu'admin", page);

    await page.waitForSelector('#tiroir.ouvert');
    await page.waitForLoadState('networkidle');

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Tout sélectionner', page);
    await clicSurBouton('Récapitulatif', page);

    await checkIntermediaire.valideEtape(page);

    await clicSurBouton('Enregistrer les modifications', page);

    await page.waitForResponse(
      (r) => r.url().includes('/api/admin/utilisateurs') && r.status() === 200
    );
  }

  await verifieTiroirAttributionRole();
  await verifieTiroirRetraitRole();
  await verifieTiroirNommeAdmin();
});

test(`La page qui liste les entités du périmètre d'un admin n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('admin-entites');

  await navigueSurPageConnectee('/admin/entites', page, utilisateurAdmin.email);

  await checkIntermediaire.valideEtape(page);

  await clicSurBouton('Gérer les admins', page);

  await page.waitForSelector('#tiroir.ouvert');
  await page.waitForLoadState('networkidle');

  await checkIntermediaire.valideEtape(page);

  await remplirChamp('ajout-email-admin', utilisateurLambda.email, page);
  await clicSurBouton('Ajouter cet admin', page);

  await checkIntermediaire.valideEtape(page);

  await clicSurBouton('Envoyer une invitation', page);

  await page.waitForResponse(
    (r) => r.url().includes('/api/admin/entites') && r.status() === 200
  );
});

test(`La page qui liste les administrateurs du périmètre d'un superviseur n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire(
    'superviseurs-administrateurs'
  );

  await navigueSurPageConnectee(
    '/admin/administrateurs',
    page,
    utilisateurSuperviseur.email
  );

  await checkIntermediaire.valideEtape(page);
});
