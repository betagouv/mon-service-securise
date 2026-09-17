import { expect, test } from '@playwright/test';
import { navigueSurPageConnectee } from './aideAuxTests.js';
import { donneesTestsAccessibilite } from '../test_accessibilite/donneesTestAccessibilite.js';

const { utilisateurSuperviseur, utilisateurAdmin } = donneesTestsAccessibilite;

test("La page qui liste les administrateurs du périmètre d'un superviseur affiche les admins de ses entités", async ({
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
      '/admin/administrateurs',
      page,
      utilisateurSuperviseur.email
    ),
  ]);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Admins' })
  ).toBeVisible();
  await expect(
    page.getByText(`${utilisateurAdmin.prenom} ${utilisateurAdmin.nom}`).first()
  ).toBeVisible();
});
