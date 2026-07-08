/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  captureDEcran,
  messageDErreur,
  navigueSurPageConnectee,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { idServiceV2 } = donneesTestsAccessibilite;

const pages = [
  {
    nom: 'Description du service',
    url: `/service/${idServiceV2}/descriptionService`,
  },
  {
    nom: 'Mesures du service',
    url: `/service/${idServiceV2}/mesures`,
  },
  {
    nom: 'Indice cyber',
    url: `/service/${idServiceV2}/indiceCyber`,
  },
  {
    nom: 'Rôles et responsabilités',
    url: `/service/${idServiceV2}/rolesResponsabilites`,
  },
  { nom: 'Risques', url: `/service/${idServiceV2}/risques` },
  { nom: 'Dossiers', url: `/service/${idServiceV2}/dossiers` },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await navigueSurPageConnectee(url, page);
    await captureDEcran(page, `page-service-${nom}.png`);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}
