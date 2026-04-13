/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
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
  { nom: 'Création de compte', url: '/creation-compte' },
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
