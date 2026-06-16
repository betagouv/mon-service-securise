import { expect, Page, test } from '@playwright/test';
import {
  captureDEcran,
  CheckIntermediaire,
  messageDErreur,
  navigueSurPageConnectee,
  navigueSurTableauDeBordSansConnexion,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';

const cliquerSuivant = (page: Page) =>
  page.getByRole('button', { name: 'Suivant' }).click();

const remplirChamp = async (idInput: string, valeur: string, page: Page) => {
  await page.locator(`input#${idInput}`).click();
  await page.keyboard.type(valeur);
  await page.keyboard.press('Tab');
};

let idService: string;
let nomService: string;

test.beforeEach(async ({ page }) => {
  await navigueSurPageConnectee('/service/v2/creation', page);

  nomService = `Mon service test ${new Date().getTime()}`;
  await remplirChamp('nom-service', nomService, page);
  const reponse = await page.waitForResponse(
    (r) => r.url().includes('/api/brouillon-service') && r.status() === 200
  );
  const { id } = await reponse.json();
  idService = id;
});

test.afterEach(async ({ page }) => {
  await navigueSurTableauDeBordSansConnexion(page);
  await page.click(`input.selection-service[value="${idService}"]`);
  await page.locator('button', { hasText: 'Supprimer' }).first().click();
  await page.locator('input#confirmation-suppression').fill(nomService);
  await page.click('text="Confirmer la suppression"');
});

test("Le formulaire de création de service v2 n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('creation-service');

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  const siretPrerempli = await page.evaluate(
    () =>
      !!(document.querySelector('input.valeur-cache') as HTMLInputElement)
        ?.value
  );
  if (!siretPrerempli) {
    await page.locator('input#siret').click();
    await page.keyboard.type('ANSSI');
    await page.waitForSelector('.liste-suggestions.visible');
    await page.click('.liste-suggestions .option:first-child');
  }
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="enProjet"]');
  await captureDEcran(page, 'creation-service-debug.png');

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="portailInformation"]');
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="onPremise"]');
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="interneRestreint"]');

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="limitee"]');

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="plusDe24h"]');

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="faible"]');

  await checkIntermediaire.valideEtape(page);
  await page.click('label[for="UE"]');

  await checkIntermediaire.valideEtape(page);
  await cliquerSuivant(page);

  await checkIntermediaire.valideEtape(page);
});

test("Le formulaire de création de service v2 en mode rapide n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  await page.click('id=modeRapide');

  const problemes = await problemesDAccessibiliteDeLaPage(page);
  await captureDEcran(page, 'creation-service-rapide.png');

  expect(problemes.length, messageDErreur(problemes)).toBe(0);
});
