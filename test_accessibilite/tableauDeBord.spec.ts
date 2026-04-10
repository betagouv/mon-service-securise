import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import {
  messageDErreur,
  navigueSurPageConnectee,
  problemesSerieux,
} from './aideAuxTests.js';

test("Le tableau de bord n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  await navigueSurPageConnectee('/tableauDeBord', page);
  await page.click('text=Me le rappeler plus tard');

  const resultats = await new AxeBuilder({ page }).analyze();
  const problemes = problemesSerieux(resultats);

  expect(problemes.length, messageDErreur(problemes)).toBe(0);
});
