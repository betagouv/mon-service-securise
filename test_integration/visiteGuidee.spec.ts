import { expect, test } from '@playwright/test';
import { navigueSurTableauDeBord } from './aideAuxTests.js';

test(`La visite guidée est fonctionnelle`, async ({ page }) => {
  await navigueSurTableauDeBord(page);
  await page.click("text= Centre d'aide");
  await page.click('text=🔎 Parcourir la visite guidée');
  await page.waitForEvent('load');

  await page.click('text=Découvrez les fonctionnalités essentielles');
  await page.waitForURL('/visiteGuidee');

  await expect(page.getByText('Étape 1 sur 4').first()).toBeVisible();
  await expect(
    page.locator('details[data-visite-guidee-id="besoins-securite-niveau1"]')
  ).toBeVisible();
  await page.click('text=Suivant');

  await expect(page.getByText('Étape 2 sur 4').first()).toBeVisible();
  await expect(
    page.locator('aside[data-visite-guidee-id="tiroir"]')
  ).toBeVisible();
  await page.click('text=Suivant');

  await expect(page.getByText('Étape 3 sur 4').first()).toBeVisible();
  await expect(
    page.locator('tr[data-visite-guidee-id="ligne-de-mesure"]').first()
  ).toBeVisible();
  await page.click('text=Suivant');

  await expect(page.getByText('Étape 4 sur 4').first()).toBeVisible();
  await expect(
    page.locator('div[data-visite-guidee-id="matrice-risques-v2"]')
  ).toBeVisible();
  await page.click('text=Suivant');

  await expect(page.getByText('À vous de jouer !')).toBeVisible();
  await page.getByRole('button', { name: 'Fonctionnalités avancées' }).click();

  await expect(page.getByText('Que souhaitez-vous découvrir ?')).toBeVisible();

  await page.click('text=📋 Gérer toutes vos mesures');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=liste-mesures');
  await expect(
    page.getByText('Gérez vos mesures depuis un seul endroit').first()
  ).toBeVisible();
  await expect(page.locator('tr#ligne-CONFORMITE-3')).toBeVisible();
  await expect(page.locator('tr#ligne-PSSI-5')).toBeVisible();
  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');

  await page.click('text=📥 Importer des services');
  await expect(
    page.getByText("Jusqu'à 250 services importés en une seule fois").first()
  ).toBeVisible();
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=televersement');
  await expect(page.locator('aside#tiroir.ouvert')).toBeVisible();
  await expect(page.getByText('Téléverser des services').first()).toBeVisible();
  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');

  await page.click('text=👥 Collaborer avec votre équipe');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=contributeurs');
  await expect(
    page.getByText('Travaillez avec votre équipe').first()
  ).toBeVisible();
  await expect(page.locator('aside#tiroir.ouvert')).toBeVisible();
  await expect(page.getByText('Gérer les contributeurs').first()).toBeVisible();
  await page.click('text=Revenir à la liste des fonctionnalités');
  await page.waitForEvent('load');

  await page.click('text=📊 Piloter votre entité');
  await page.waitForURL('/visiteGuidee?etapeAdditionnelle=organisations');
  await expect(
    page.getByText('Suivez tous les services de votre entité').first()
  ).toBeVisible();
  await expect(
    page.locator('div[data-visite-guidee-id="admin-statistiques"]')
  ).toBeVisible();
});
