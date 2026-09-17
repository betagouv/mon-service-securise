import { expect, Page, test } from '@playwright/test';
import {
  fermeModaleNouveauReferentielSiPresente,
  fermeModaleVisiteGuideeSiPresente,
  navigueSurPageConnectee,
  remplirChamp,
} from './aideAuxTests.js';

const cliquerSuivant = (page: Page) =>
  page.getByRole('button', { name: 'Suivant' }).click();

const navigueSurTableauDeBord = async (page: Page) => {
  await navigueSurPageConnectee('/tableauDeBord', page);
  await fermeModaleNouveauReferentielSiPresente(page);
  await fermeModaleVisiteGuideeSiPresente(page);
};

let idService: string;
let nomService: string;

test.describe.serial('Création de service v2', () => {
  test('Le parcours de création de service v2 permet de créer un service et d’accéder à ses mesures', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await navigueSurTableauDeBord(page);

    await page
      .getByRole('button', { name: 'Ajouter un / des services' })
      .click();
    await page.getByRole('button', { name: 'Ajouter un service' }).click();
    await page.waitForURL('**/service/v2/creation');

    nomService = `Service test ${Date.now()}`;
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

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/niveauSecuriteRequis') && r.status() === 200
      ),
      cliquerSuivant(page),
    ]);

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/finalise') && r.status() === 200
      ),
      page
        .getByRole('button', { name: 'Commencer à sécuriser le service' })
        .click(),
    ]);

    // finaliseBrouillonService renvoie un id de service distinct de celui du
    // brouillon : on le récupère depuis l'URL de redirection plutôt que dans
    // le corps de la réponse /finalise, vidé dès que la navigation démarre.
    await page.waitForURL(/\/service\/[0-9a-f-]+\/mesures/);
    [, idService] = page.url().match(/\/service\/([0-9a-f-]+)\/mesures/)!;
  });

  test('Le service nouvellement créé est accessible depuis le tableau de bord', async ({
    page,
  }) => {
    await navigueSurTableauDeBord(page);

    await page.getByRole('link', { name: nomService }).click();
    await page.waitForURL(`**/service/${idService}/mesures`);

    await expect(
      page.getByRole('heading', { level: 1, name: nomService })
    ).toBeVisible();
  });

  test.describe('Les pages du service sont accessibles', () => {
    test('La page mesures affiche des mesures et permet de changer leur statut', async ({
      page,
    }) => {
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes(`/api/service/${idService}/mesures`) &&
            r.request().method() === 'GET' &&
            r.status() === 200
        ),
        navigueSurPageConnectee(`/service/${idService}/mesures`, page),
      ]);

      await page.getByRole('button', { name: 'Toutes les mesures' }).click();

      const premiereLigne = page.locator('tr.ligne-de-mesure').first();
      await expect(premiereLigne).toBeVisible();
      const idLigne = await premiereLigne
        .locator('select[id^="statut-"]')
        .getAttribute('id');

      const selectStatut = page.locator(`[id="${idLigne}"]`);
      await Promise.all([
        page.waitForResponse(
          (r) =>
            /\/api\/service\/[0-9a-f-]+\/mesures\//.test(r.url()) &&
            r.request().method() === 'PUT' &&
            r.status() === 200
        ),
        selectStatut.selectOption({ label: 'Partielle' }),
      ]);

      await expect(selectStatut).toHaveValue('enCours');
    });
  });
});
