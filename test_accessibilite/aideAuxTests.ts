import { appendFileSync, mkdirSync } from 'fs';
import { expect, Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { AxeResults } from 'axe-core';
import { TokenMSSPourCreationUtilisateur } from '../src/utilisateur/tokenMSSPourCreationUtilisateur.js';
import { adaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import * as adaptateurEnvironnement from '../src/adaptateurs/adaptateurEnvironnement.js';
import { donneesTestsAccessibilite } from './donneesTestAccessibilite.js';

const { ACCESSIBILITE_DOSSIER_RAPPORT } = process.env;
const FICHIER_VIOLATIONS = `${ACCESSIBILITE_DOSSIER_RAPPORT}/violations.jsonl`;

export type ProblemeAccessibilite = {
  id: string;
  description: string;
  noeuds: string[];
  niveau: 'sérieux' | 'critique';
};

const alimenteRapportFinal = (url: string, analyse: AxeResults) => {
  mkdirSync(ACCESSIBILITE_DOSSIER_RAPPORT!, { recursive: true });
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

export const captureDEcran = async (page: Page, nomImage: string) => {
  mkdirSync(process.env.ACCESSIBILITE_DOSSIER_SCREENSHOTS!, {
    recursive: true,
  });
  await page.screenshot({
    path: `${process.env.ACCESSIBILITE_DOSSIER_SCREENSHOTS}/${nomImage}`,
  });
};

export const messageDErreur = (problemes: ProblemeAccessibilite[]) =>
  `${JSON.stringify(problemes, null, 2)}\n n'est pas vide.`;

export const problemesDAccessibiliteDeLaPage = async (
  page: Page
): Promise<ProblemeAccessibilite[]> => {
  const analyse = await new AxeBuilder({ page })
    .exclude('lab-anssi-centre-aide')
    .exclude('dsfr-header')
    .analyze();

  alimenteRapportFinal(page.url(), analyse);

  return construisResultat(analyse);
};

export const navigueSurPageConnectee = async (
  urlPage: string,
  page: Page,
  emailConnexion: string = donneesTestsAccessibilite.utilisateurLambda.email
) => {
  // Déconnecte l'utilisateur courant, pour éviter les conflits entre les exécutions.
  await page.goto('/connexion');

  const redirect = urlPage.replaceAll('/', '%2F');

  await page.context().addCookies([
    {
      name: 'AgentConnectInfo',
      domain: 'localhost',
      path: '/',
      value: `j:${JSON.stringify({
        state: 'FAKE_STATE',
        nonce: 'FAKE_NONCE',
        urlRedirection: redirect,
      })}`,
      expires: Math.floor(Date.now() / 1000) + 5 * 60_000,
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    },
  ]);

  await page.goto(`/oidc/apres-authentification?email=${emailConnexion!}`);
  await page.waitForURL(urlPage, { waitUntil: 'networkidle' });
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

export const genereTokenPourCreationCompte = () =>
  new TokenMSSPourCreationUtilisateur(
    adaptateurJWT({ adaptateurEnvironnement })
  ).cree({
    nom: 'John',
    prenom: 'Doe',
    email: 'compte-a-creer@mss.fr',
    organisation: {
      departement: '75',
      siret: '13000766900018',
      nom: 'ANSSI',
    },
  });

export class CheckIntermediaire {
  private etape = 1;

  constructor(private readonly nom: string) {}

  async valideEtape(page: Page) {
    const problemes = await problemesDAccessibiliteDeLaPage(page);
    await captureDEcran(page, `${this.nom}-${this.etape}.png`);

    expect
      .soft(
        problemes.length,
        `${this.nom}-${this.etape}: \n${messageDErreur(problemes)}`
      )
      .toBe(0);
    this.etape += 1;
  }
}
