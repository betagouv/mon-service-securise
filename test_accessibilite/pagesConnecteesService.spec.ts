/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  captureDEcran,
  messageDErreur,
  navigueSurPageConnectee,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { idService } = donneesTestsAccessibilite;

const pages = [
  {
    nom: 'Description du service',
    url: `/service/${idService}/descriptionService`,
  },
  {
    nom: 'Mesures du service',
    url: `/service/${idService}/mesures`,
  },
  {
    nom: 'Indice cyber',
    url: `/service/${idService}/indiceCyber`,
  },
  {
    nom: 'Rôles et responsabilités',
    url: `/service/${idService}/rolesResponsabilites`,
  },
  { nom: 'Risques', url: `/service/${idService}/risques` },
  { nom: 'Dossiers', url: `/service/${idService}/dossiers` },
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
