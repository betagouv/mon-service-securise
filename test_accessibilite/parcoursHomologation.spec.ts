import { test } from '@playwright/test';
import { CheckIntermediaire, navigueSurPageConnectee } from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { idServiceV2, utilisateurLambda } = donneesTestsAccessibilite;

test('Le parcours de création d’un dossier d’homologation n’a aucune violation grave d’accessibilité', async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('parcours-homologation');

  // Le service fixture a déjà un dossier en cours avec l'étape "Autorité"
  // renseignée : y accéder directement reste possible (on peut revenir en
  // arrière dans le parcours), les champs sont déjà pré-remplis.
  await navigueSurPageConnectee(
    `/service/${idServiceV2}/homologation/edition/etape/autorite`,
    page,
    utilisateurLambda.email
  );
  await checkIntermediaire.valideEtape(page);
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape "Avis"
  await page.waitForURL(
    `**/service/${idServiceV2}/homologation/edition/etape/avis`
  );
  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="aucun"]');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape "Documents"
  await page.waitForURL(
    `**/service/${idServiceV2}/homologation/edition/etape/documents`
  );
  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="aucun"]');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape de téléchargement de l'archive du dossier (id "dateTelechargement",
  // libellé stepper trompeur "Décision")
  await page.waitForURL(
    `**/service/${idServiceV2}/homologation/edition/etape/dateTelechargement`
  );
  await checkIntermediaire.valideEtape(page);
  await Promise.all([
    page.waitForEvent('download'),
    page.getByText("MonServiceSécurisé - Dossier d'homologation").click(),
  ]);
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape "Date" (libellé stepper trompeur, id réel "decision")
  await page.waitForURL(
    `**/service/${idServiceV2}/homologation/edition/etape/decision`
  );
  await checkIntermediaire.valideEtape(page);
  await page.locator('input[type="date"]').fill('2026-01-15');
  await page.click('label[for="validee-oui"]');
  await page.click('label[for="duree-unAn"]');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape "Récapitulatif"
  await page.waitForURL(
    `**/service/${idServiceV2}/homologation/edition/etape/recapitulatif`
  );
  await checkIntermediaire.valideEtape(page);

  await page.getByRole('button', { name: 'Enregistrer la décision' }).click();

  // Page "Dossiers" après finalisation, avec la modale de félicitations
  await page.waitForURL(
    /\/service\/[0-9a-f-]+\/dossiers\?succesHomologation=true/
  );
  await checkIntermediaire.valideEtape(page);
});
