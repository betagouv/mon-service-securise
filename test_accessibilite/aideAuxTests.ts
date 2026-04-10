import type { AxeResults, Result } from 'axe-core';
import { Page } from '@playwright/test';

export const messageDErreur = (problemes: Result[]) =>
  `${JSON.stringify(
    problemes.map(({ id, description, nodes }) => ({
      id,
      description,
      nodes: nodes.map((n) => n.html),
    })),
    null,
    2
  )}\n n'est pas vide.`;

export const problemesSerieux = (resultats: AxeResults) =>
  resultats.violations.filter((v) => v.impact === 'serious');

export const navigueSurPageConnectee = async (urlPage: string, page: Page) => {
  const redirect = urlPage.replace('/', '%2F');
  await page.goto(`/connexion?urlRedirection=${redirect}`);
  await page.click("text=S'identifier avec ProConnect");
  await page.waitForURL(/dev-agentconnect/);
  await page.fill('input[type="email"]', 'test@fia1.fr');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dev-agentconnect/);
  await page.click('button[type="submit"]');
  await page.waitForURL(urlPage);
};
