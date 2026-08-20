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
  await checkIntermediaire.valideEtape(page);
  await page.click("text= Centre d'aide");
  await page.click('text=🔎 Parcourir la visite guidée');
  await page.waitForEvent('load');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Découvrez les fonctionnalités essentielles');
  await page.waitForURL('/visiteGuidee');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Suivant');
  await page.waitForSelector('text=À vous de jouer !');
  await checkIntermediaire.valideEtape(page);

  await page.getByRole('button', { name: 'Fonctionnalités avancées' }).click();
  await page.waitForSelector('text=Que souhaitez-vous découvrir ?');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=📋 Gérer toutes vos mesures');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=liste-mesures');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');
  await page.click('text=📥 Importer des services');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=televersement');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');
  await page.click('text=👥 Collaborer avec votre équipe');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=contributeurs');
  await checkIntermediaire.valideEtape(page);

  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');
  await page.click('text=📊 Piloter votre entité');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=organisations');
  await checkIntermediaire.valideEtape(page);
});
