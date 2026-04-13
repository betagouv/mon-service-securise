import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import {
  messageDErreur,
  navigueSurTableauDeBord,
  problemesSerieux,
} from './aideAuxTests.js';

test(`La visite guidée n'a aucune violation grave d'accessibilité`, async ({
  page,
}) => {
  const checkDEtape = async (nomEtape: string) => {
    const resultats = await new AxeBuilder({ page }).analyze();
    const problemes = problemesSerieux(resultats);
    await page.screenshot({
      path: `screenshots/visite-guidee-${nomEtape}.png`,
    });

    expect
      .soft(problemes.length, `${nomEtape}: \n${messageDErreur(problemes)}`)
      .toBe(0);
  };

  await navigueSurTableauDeBord(page);
  await page.click("text= Centre d'aide");
  await page.click('text=🔎 Parcourir la visite guidée');
  await page.waitForEvent('load');
  await checkDEtape('popin-accueil');

  await page.click('text=Démarrer la visite guidée');
  await checkDEtape('menu-accueil');

  await page.click("text=C'est parti !");
  await page.waitForURL('/visiteGuidee/decrire');
  await checkDEtape('decrire-1');

  await page.click('text=Suivant ');
  await checkDEtape('decrire-2');

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/securiser');
  await checkDEtape('securiser-1');

  await page.click('text=Suivant ');
  await checkDEtape('securiser-2');

  await page.click('text=Suivant ');
  await checkDEtape('securiser-3');

  await page.click('text=Suivant ');
  await checkDEtape('securiser-4');

  await page.click('text=Suivant ');
  await checkDEtape('securiser-5');

  await page.click('text=Suivant ');
  await checkDEtape('securiser-6');

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/homologuer');
  await checkDEtape('homologuer-1');

  await page.click('text=Suivant ');
  await checkDEtape('homologuer-2');

  await page.click('text=Suivant ');
  await page.waitForURL('/visiteGuidee/piloter');
  await checkDEtape('piloter-1');

  await page.click('text=Suivant ');
  await checkDEtape('piloter-2');

  await page.click('text=Suivant ');
  await checkDEtape('piloter-3');
});
