/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  captureDEcran,
  messageDErreur,
  navigueSurPageConnectee,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { idServiceV1, idServiceV2 } = donneesTestsAccessibilite;

const pages = [
  {
    nom: 'Description du service',
    url: `/descriptionService`,
  },
  {
    nom: 'Mesures du service',
    url: `/mesures`,
  },
  {
    nom: 'Indice cyber',
    url: `/indiceCyber`,
  },
  {
    nom: 'Rôles et responsabilités',
    url: `/rolesResponsabilites`,
  },
  { nom: 'Risques', url: `/risques` },
  { nom: 'Dossiers', url: `/dossiers` },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité pour un service V1`, async ({
    page,
  }) => {
    const urlComplet = `/service/${idServiceV1}${url}`;
    await navigueSurPageConnectee(urlComplet, page);
    await captureDEcran(page, `page-service-v1-${nom}.png`);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });

  test(`La page ${nom} n'a aucune violation grave d'accessibilité pour un service V2`, async ({
    page,
  }) => {
    const urlComplet = `/service/${idServiceV2}${url}`;
    await navigueSurPageConnectee(urlComplet, page);
    await captureDEcran(page, `page-service-v2-${nom}.png`);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}
