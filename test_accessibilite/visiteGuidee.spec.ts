import { test } from '@playwright/test';
import {
  CheckIntermediaire,
  navigueSurTableauDeBordAvecConnexion,
} from './aideAuxTests.js';

test(`La visite guidée n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkIntermediaire = new CheckIntermediaire('visite-guidee');

  await navigueSurTableauDeBordAvecConnexion(page);
  await page.click("text= Centre d'aide");
  await page.click('text=🔎 Parcourir la visite guidée');
  await page.waitForEvent('load');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Démarrer la visite guidée');
  await checkIntermediaire.valideEtape(page);

  await page.click("text=C'est parti !");
  await page.waitForURL('/visiteGuidee/decrire');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/mesures');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/dossiers');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/piloter');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant ');
  await checkIntermediaire.valideEtape(page);
});
