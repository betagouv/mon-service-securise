/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  ID_SERVICE,
  messageDErreur,
  navigueSurPageConnectee,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';

const pages = [
  {
    nom: 'Description du service',
    url: `/service/${ID_SERVICE}/descriptionService`,
  },
  { nom: 'Mesures du service', url: `/service/${ID_SERVICE}/mesures` },
  { nom: 'Indice cyber', url: `/service/${ID_SERVICE}/indiceCyber` },
  {
    nom: 'Rôles et responsabilités',
    url: `/service/${ID_SERVICE}/rolesResponsabilites`,
  },
  { nom: 'Risques', url: `/service/${ID_SERVICE}/risques` },
  { nom: 'Risques v2', url: `/service/${ID_SERVICE}/risques/v2` },
  { nom: 'Dossiers', url: `/service/${ID_SERVICE}/dossiers` },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await navigueSurPageConnectee(url, page);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}
