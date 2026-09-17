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
    test('On peut télécharger tous les documents', async ({ page }) => {
      await navigueSurPageConnectee(`/service/${idService}/mesures`, page);

      await page.getByRole('button', { name: 'Documents' }).click();

      const carteZip = page
        .locator('.document-telechargeable')
        .filter({ hasText: 'Tous les documents' });

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        carteZip.getByRole('link', { name: 'Télécharger' }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/^MSS_decision_.*\.zip$/);
    });

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

    test('La page risques permet de désactiver un risque', async ({ page }) => {
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes(`/api/service/${idService}/risques/v2`) &&
            r.request().method() === 'GET' &&
            r.status() === 200
        ),
        navigueSurPageConnectee(`/service/${idService}/risques`, page),
      ]);

      const toggleActivation = page
        .locator('input[type="checkbox"][id^="risque-"][id$="-actif"]')
        .first();
      await expect(toggleActivation).toBeVisible();
      await expect(toggleActivation).toBeChecked();
      const idToggle = await toggleActivation.getAttribute('id');

      await Promise.all([
        page.waitForResponse(
          (r) =>
            /\/api\/service\/[0-9a-f-]+\/risques\/v2\//.test(r.url()) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.click(`label[for="${idToggle}"]`),
      ]);

      await expect(toggleActivation).not.toBeChecked();
    });

    test("On peut créer et finaliser un dossier d'homologation, puis télécharger le tampon", async ({
      page,
    }) => {
      test.setTimeout(60_000);

      await navigueSurPageConnectee(`/service/${idService}/dossiers`, page);

      await expect(
        page.getByRole('heading', {
          level: 4,
          name: 'Aucun projet d’homologation en cours',
        })
      ).toBeVisible();

      await page
        .getByRole('button', { name: "Créer un nouveau projet d'homologation" })
        .click();

      await Promise.all([
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(`/api/service/${idService}/homologation/reprends`) &&
            r.request().method() === 'POST' &&
            r.status() === 200
        ),
        page
          .getByRole('button', { name: 'Ok, j’homologue le service !' })
          .click(),
      ]);

      // Étape "Autorité"
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/autorite`
      );
      await page.getByLabel('Prénom Nom').fill('Jean Dupont');
      await page.getByLabel('Fonction').fill('Directeur général');
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(`/api/service/${idService}/homologation/autorite`) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.getByRole('button', { name: 'Suivant' }).click(),
      ]);

      // Étape "Avis"
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/avis`
      );
      await page.click('label[for="aucun"]');
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes(`/api/service/${idService}/homologation/avis`) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.getByRole('button', { name: 'Suivant' }).click(),
      ]);

      // Étape "Documents"
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/documents`
      );
      await page.click('label[for="aucun"]');
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(`/api/service/${idService}/homologation/documents`) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.getByRole('button', { name: 'Suivant' }).click(),
      ]);

      // Étape de téléchargement de l'archive du dossier (id "dateTelechargement",
      // libellé stepper trompeur "Décision")
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/dateTelechargement`
      );
      const [downloadDossier] = await Promise.all([
        page.waitForEvent('download'),
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(
                `/api/service/${idService}/homologation/telechargement`
              ) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.getByText("MonServiceSécurisé - Dossier d'homologation").click(),
      ]);
      expect(downloadDossier.suggestedFilename()).toMatch(/\.zip$/);
      await page.getByRole('button', { name: 'Suivant' }).click();

      // Étape "Date" (libellé stepper trompeur, id réel "decision")
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/decision`
      );
      await page.locator('input[type="date"]').fill('2026-01-15');
      await page.click('label[for="validee-oui"]');
      await page.click('label[for="duree-unAn"]');
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(`/api/service/${idService}/homologation/decision`) &&
            r.request().method() === 'PUT' &&
            r.status() === 204
        ),
        page.getByRole('button', { name: 'Suivant' }).click(),
      ]);

      // Étape "Récapitulatif"
      await page.waitForURL(
        `**/service/${idService}/homologation/edition/etape/recapitulatif`
      );
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(`/api/service/${idService}/homologation/finalise`) &&
            r.request().method() === 'POST' &&
            r.status() === 204
        ),
        page.getByRole('button', { name: 'Enregistrer la décision' }).click(),
      ]);

      await page.waitForURL(
        /\/service\/[0-9a-f-]+\/dossiers\?succesHomologation=true/
      );

      const [downloadTampon] = await Promise.all([
        page.waitForEvent('download'),
        page
          .getByRole('link', { name: "Télécharger l'encart d'homologation" })
          .click(),
      ]);
      expect(downloadTampon.suggestedFilename()).toMatch(/\.zip$/);
    });
  });
});
