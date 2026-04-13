import { expect, Page, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import {
  messageDErreur,
  navigueSurPageConnectee,
  problemesSerieux,
} from './aideAuxTests.js';

const cliquerSuivant = (page: Page) =>
  page.getByRole('button', { name: 'Suivant' }).click();

const remplirChamp = async (idInput: string, valeur: string, page: Page) => {
  await page.locator(`input#${idInput}`).click();
  await page.keyboard.type(valeur);
  await page.keyboard.press('Tab');
};

test("Le formulaire de création de service v2 n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  let etape = 1;
  const checkIntermediaire = async () => {
    const resultats = await new AxeBuilder({ page }).analyze();
    const problemes = problemesSerieux(resultats);
    await page.screenshot({
      path: `screenshots/creation-service-${etape}.png`,
    });

    expect
      .soft(problemes.length, `${etape}: \n${messageDErreur(problemes)}`)
      .toBe(0);
    etape += 1;
  };

  await navigueSurPageConnectee('/service/v2/creation', page);
  await checkIntermediaire();

  await remplirChamp('nom-service', 'Mon service test', page);
  await page.waitForResponse(
    (r) => r.url().includes('/api/brouillon-service') && r.status() === 200
  );
  await cliquerSuivant(page);

  await checkIntermediaire();
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

  await checkIntermediaire();
  await page.click('label[for="enProjet"]');
  await page.screenshot({
    path: `screenshots/creation-service-debug.png`,
  });

  await checkIntermediaire();
  await cliquerSuivant(page);

  await checkIntermediaire();
  await cliquerSuivant(page);

  await checkIntermediaire();
  await page.click('label[for="portailInformation"]');
  await cliquerSuivant(page);

  await checkIntermediaire();
  await cliquerSuivant(page);

  await checkIntermediaire();
  await page.click('label[for="onPremise"]');
  await cliquerSuivant(page);

  await checkIntermediaire();
  await page.click('label[for="interneRestreint"]');

  await checkIntermediaire();
  await page.click('label[for="limitee"]');

  await checkIntermediaire();
  await page.click('label[for="plusDe24h"]');

  await checkIntermediaire();
  await cliquerSuivant(page);

  await checkIntermediaire();
  await page.click('label[for="faible"]');

  await checkIntermediaire();
  await page.click('label[for="UE"]');

  await checkIntermediaire();
  await cliquerSuivant(page);

  await checkIntermediaire();
});

test("Le formulaire de création de service v2 en mode rapide n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  await navigueSurPageConnectee('/service/v2/creation', page);
  await remplirChamp('nom-service', 'Mon service test', page);
  await page.waitForResponse(
    (r) => r.url().includes('/api/brouillon-service') && r.status() === 200
  );
  await page.click('id=modeRapide');

  const resultats = await new AxeBuilder({ page }).analyze();
  const problemes = problemesSerieux(resultats);
  await page.screenshot({ path: 'screenshots/creation-service-rapide.png' });

  expect.soft(problemes.length, messageDErreur(problemes)).toBe(0);
});
