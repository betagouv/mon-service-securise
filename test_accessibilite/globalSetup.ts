import { rmSync } from 'fs';
import { chromium, FullConfig, Page } from '@playwright/test';
import {
  captureDEcran,
  fermeModale2FASiPresente,
  fermeModaleVisiteGuideeSiPresente,
} from './aideAuxTests.js';

const cliquerSuivant = (page: Page) =>
  page.getByRole('button', { name: 'Suivant' }).click();

const remplirChamp = async (idInput: string, valeur: string, page: Page) => {
  await page.locator(`input#${idInput}`).click();
  await page.keyboard.type(valeur);
  await page.keyboard.press('Tab');
};

export default async (config: FullConfig) => {
  rmSync('test_accessibilite/rapport/violations.jsonl', { force: true });

  const urlBase = config.projects[0].use.baseURL;
  process.env.EMAIL_CONNEXION = config.webServer!.env!.EMAIL_CONNEXION;
  process.env.DOSSIER_RAPPORT = config.webServer!.env!.DOSSIER_RAPPORT;
  process.env.DOSSIER_SCREENSHOTS = config.webServer!.env!.DOSSIER_SCREENSHOTS;
  process.env.SECRET_JWT = config.webServer!.env!.SECRET_JWT;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const creerUtilisateur = async () => {
    try {
      await page.goto(`${urlBase}/connexion`);
      await page.click('a[href^="/oidc/connexion"]');
      await page.waitForURL(/dev-agentconnect/);
      await page.fill('input[type="email"]', process.env.EMAIL_CONNEXION!);
      await page.click('button[type="submit"]');
      await page.waitForURL(/dev-agentconnect/);
      await page.click('button[type="submit"]');
      await page.waitForURL(/creation-compte/);
      await page.click('text=Suivant');
      await page.click('.declencheur');
      await page.click('#RSSI');
      await page.click('body');
      await page.selectOption('#estimation-nombre-services', '1_10');
      await page.click('text=Suivant');
      await page.click('#cguAcceptees');
      await page.click('text=Valider');
    } catch (e) {
      await captureDEcran(page, `globalSetup-creerUtilisateur-failure.png`);
      throw e;
    }
  };

  const creerService = async () => {
    try {
      await page.waitForURL(/tableauDeBord/);
      await fermeModale2FASiPresente(page);
      await fermeModaleVisiteGuideeSiPresente(page);
      await page.waitForLoadState('domcontentloaded');
      await page.click('text=Ajouter votre premier service');
      await page.click('text=Ajouter un service');

      const nomService = `Mon service test ${new Date().getTime()}`;
      await remplirChamp('nom-service', nomService, page);
      await page.waitForResponse(
        (r) => r.url().includes('/api/brouillon-service') && r.status() === 200
      );
      await cliquerSuivant(page);

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
      await page.click('label[for="enProjet"]');
      await cliquerSuivant(page);
      await cliquerSuivant(page);
      await page.click('label[for="portailInformation"]');
      await cliquerSuivant(page);
      await cliquerSuivant(page);
      await page.click('label[for="onPremise"]');
      await cliquerSuivant(page);
      await page.click('label[for="interneRestreint"]');
      await page.click('label[for="limitee"]');
      await page.click('label[for="plusDe24h"]');
      await cliquerSuivant(page);
      await page.click('label[for="faible"]');
      await page.click('label[for="UE"]');
      await cliquerSuivant(page);
      await page.click('text=Commencer à sécuriser le service');
      await page.waitForURL(/mesures/);
      const urlPageMesures = page.url();
      const id = urlPageMesures.split('service/')[1].split('/')[0];
      process.env.ID_SERVICE = id;
    } catch (e) {
      await captureDEcran(page, `globalSetup-creerService-failure.png`);
      throw e;
    }
  };

  await creerUtilisateur();
  await creerService();
  await browser.close();
};
