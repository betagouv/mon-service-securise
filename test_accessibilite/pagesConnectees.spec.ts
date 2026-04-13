/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import {
  messageDErreur,
  navigueSurPageConnectee,
  navigueSurTableauDeBord,
  problemesSerieux,
} from './aideAuxTests.js';

const pages = [
  { nom: 'Profil', url: '/profil' },
  { nom: 'Mesures', url: '/mesures' },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await navigueSurPageConnectee(url, page);

    const resultats = await new AxeBuilder({ page }).analyze();
    const problemes = problemesSerieux(resultats);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}

test("La page tableau de bord n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  await navigueSurTableauDeBord(page);

  const resultats = await new AxeBuilder({ page }).analyze();
  const problemes = problemesSerieux(resultats);

  expect(problemes.length, messageDErreur(problemes)).toBe(0);
});
