/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  messageDErreur,
  navigueSurPageConnectee,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';

const pages = [
  {
    nom: "La liste des utilisateurs dans le périmètre d'un admin",
    url: `/admin/utilisateurs`,
  },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    const emailAdmin = process.env.ACCESSIBILITE_EMAIL_ADMIN;
    await navigueSurPageConnectee(url, page, emailAdmin);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}
