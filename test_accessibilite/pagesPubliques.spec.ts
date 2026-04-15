/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  genereTokenPourCreationCompte,
  messageDErreur,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';

const pages = [
  { nom: 'Accueil', url: '/' },
  { nom: 'À propos', url: '/aPropos' },
  { nom: 'Doctrine homologation ANSSI', url: '/doctrine-homologation-anssi' },
  { nom: 'Sécurité', url: '/securite' },
  { nom: 'Accessibilité', url: '/accessibilite' },
  { nom: 'CGU', url: '/cgu' },
  { nom: 'Confidentialité', url: '/confidentialite' },
  { nom: 'Mentions légales', url: '/mentionsLegales' },
  { nom: 'Statistiques', url: '/statistiques' },
  { nom: 'Inscription', url: '/inscription' },
  { nom: 'Activation', url: '/activation' },
  { nom: 'Connexion', url: '/connexion' },
  {
    nom: 'Devenir ambassadeur·rice',
    url: '/devenir-ambassadeurrice-monservicesecurise',
  },
  {
    nom: 'Faire connaître',
    url: '/faire-connaitre-et-recommander-monservicesecurise',
  },
  { nom: 'Co-construire', url: '/co-construire-monservicesecurise' },
  { nom: 'Conseils cyber', url: '/conseils-cyber' },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await page.goto(url);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}

test("La page creation-compte n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  const checkEtape = async () => {
    const problemes = await problemesDAccessibiliteDeLaPage(page);
    expect.soft(problemes.length, messageDErreur(problemes)).toBe(0);
  };

  const token = genereTokenPourCreationCompte();
  await page.goto(`/creation-compte?token=${token}`);
  await page.waitForURL(/creation-compte/);
  await checkEtape();
  await page.click('text=Suivant');
  await checkEtape();
  await page.click('.declencheur');
  await page.click('#RSSI');
  await page.click('body');
  await page.selectOption('#estimation-nombre-services', '1_10');
  await page.click('text=Suivant');
  await checkEtape();
  await page.click('#cguAcceptees');
  await page.click('text=Valider');
});
