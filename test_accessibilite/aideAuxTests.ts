import { appendFileSync, mkdirSync } from 'fs';
import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { AxeResults } from 'axe-core';

const DOSSIER_RAPPORT = 'test_accessibilite/rapport';
const FICHIER_VIOLATIONS = `${DOSSIER_RAPPORT}/violations.jsonl`;
export const ID_SERVICE = 'a471cb88-b199-450e-ab5d-2628e8a90e42';
const EMAIL_CONNEXION = 'test@fia1.fr';

export type ProblemeAccessibilite = {
  id: string;
  description: string;
  noeuds: string[];
  niveau: 'sérieux' | 'critique';
};

const alimenteRapportFinal = (url: string, analyse: AxeResults) => {
  mkdirSync(DOSSIER_RAPPORT, { recursive: true });
  appendFileSync(
    FICHIER_VIOLATIONS,
    `${JSON.stringify({ url, violations: analyse.violations })}\n`
  );
};

const construisResultat = (analyse: AxeResults): ProblemeAccessibilite[] =>
  analyse.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map(({ id, description, nodes, impact }) => ({
      id,
      description,
      noeuds: nodes.map((n) => n.html),
      niveau: impact === 'critical' ? 'critique' : 'sérieux',
    }));

export const messageDErreur = (problemes: ProblemeAccessibilite[]) =>
  `${JSON.stringify(problemes, null, 2)}\n n'est pas vide.`;

export const problemesDAccessibiliteDeLaPage = async (
  page: Page
): Promise<ProblemeAccessibilite[]> => {
  const analyse = await new AxeBuilder({ page })
    .exclude('lab-anssi-centre-aide')
    .analyze();

  alimenteRapportFinal(page.url(), analyse);

  return construisResultat(analyse);
};

export const navigueSurPageConnectee = async (urlPage: string, page: Page) => {
  const redirect = urlPage.replace('/', '%2F');
  await page.goto(`/connexion?urlRedirection=${redirect}`);
  await page.click("text=S'identifier avec ProConnect");
  await page.waitForURL(/dev-agentconnect/);
  await page.fill('input[type="email"]', EMAIL_CONNEXION);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dev-agentconnect/);
  await page.click('button[type="submit"]');
  await page.waitForURL(urlPage);
};

export const fermeModale2FASiPresente = async (page: Page) => {
  const popin2FAEstVisible = await page
    .locator(
      ':text("Activez l\'authentification multifacteurs sur ProConnect")'
    )
    .isVisible();
  if (popin2FAEstVisible) await page.click('text=Me le rappeler plus tard');
};

export const fermeModaleVisiteGuideeSiPresente = async (page: Page) => {
  const popinVisiteGuideeeEstVisible = await page
    .locator(':text("Ignorer la visite guidée")')
    .isVisible();
  if (popinVisiteGuideeeEstVisible)
    await page.click('text=Ignorer la visite guidée');
};

export const navigueSurTableauDeBordAvecConnexion = async (page: Page) => {
  await navigueSurPageConnectee('/tableauDeBord', page);
  await fermeModale2FASiPresente(page);
  await fermeModaleVisiteGuideeSiPresente(page);
};

export const navigueSurTableauDeBordSansConnexion = async (page: Page) => {
  await page.goto('/tableauDeBord');
  await fermeModale2FASiPresente(page);
  await fermeModaleVisiteGuideeSiPresente(page);
};
