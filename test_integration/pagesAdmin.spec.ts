import { expect, test } from '@playwright/test';
import { navigueSurPageConnectee } from './aideAuxTests.js';
import { donneesTestsAccessibilite } from '../test_accessibilite/donneesTestAccessibilite.js';

const { utilisateurAdmin, utilisateurLambda, entite } =
  donneesTestsAccessibilite;

test("La page qui liste les entités du périmètre d'un admin affiche les entités administrées", async ({
  page,
}) => {
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/entites') &&
        r.request().method() === 'GET' &&
        r.status() === 200
    ),
    navigueSurPageConnectee('/admin/entites', page, utilisateurAdmin.email),
  ]);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Entités' })
  ).toBeVisible();
  await expect(
    page.locator('dsfr-table').getByText(entite.nom!).first()
  ).toBeVisible();
});

test("La page qui liste les utilisateurs du périmètre d'un admin affiche les utilisateurs de ses entités", async ({
  page,
}) => {
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes('/api/admin/utilisateurs') &&
        r.request().method() === 'GET' &&
        r.status() === 200
    ),
    navigueSurPageConnectee(
      '/admin/utilisateurs',
      page,
      utilisateurAdmin.email
    ),
  ]);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Utilisateurs' })
  ).toBeVisible();
  await expect(
    page
      .getByText(`${utilisateurLambda.prenom} ${utilisateurLambda.nom}`)
      .first()
  ).toBeVisible();
});
