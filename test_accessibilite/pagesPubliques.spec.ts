/* eslint-disable no-restricted-syntax */
import { expect, test } from '@playwright/test';
import {
  genereTokenPourCreationCompte,
  messageDErreur,
  problemesDAccessibiliteDeLaPage,
} from './aideAuxTests.js';

const pages = [
  { nom: 'Accueil', url: '/' },
  { nom: 'À propos', url: '/aPropos' },
  { nom: 'Doctrine homologation ANSSI', url: '/doctrine-homologation-anssi' },
  { nom: 'Sécurité', url: '/securite' },
  { nom: 'Accessibilité', url: '/accessibilite' },
  { nom: 'CGU', url: '/cgu' },
  { nom: 'Confidentialité', url: '/confidentialite' },
  { nom: 'Mentions légales', url: '/mentionsLegales' },
  { nom: 'Statistiques', url: '/statistiques' },
  { nom: 'Inscription', url: '/inscription' },
  { nom: 'Activation', url: '/activation' },
  { nom: 'Connexion', url: '/connexion' },
  {
    nom: 'Devenir ambassadeur·rice',
    url: '/devenir-ambassadeurrice-monservicesecurise',
  },
  {
    nom: 'Faire connaître',
    url: '/faire-connaitre-et-recommander-monservicesecurise',
  },
  { nom: 'Co-construire', url: '/co-construire-monservicesecurise' },
  { nom: 'Conseils cyber', url: '/conseils-cyber' },
];

for (const { nom, url } of pages) {
  test(`La page ${nom} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await page.goto(url);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}

test("La page creation-compte n'a aucune violation grave d'accessibilité", async ({
  page,
}) => {
  const checkEtape = async () => {
    const problemes = await problemesDAccessibiliteDeLaPage(page);
    expect.soft(problemes.length, messageDErreur(problemes)).toBe(0);
  };

  const token = genereTokenPourCreationCompte();
  await page.goto(`/creation-compte?token=${token}`);
  await page.waitForURL(/creation-compte/);
  await checkEtape();
  await page.click('text=Suivant');
  await checkEtape();
  await page.click('.declencheur');
  await page.click('#RSSI');
  await page.click('body');
  await page.selectOption('#estimation-nombre-services', '1_10');
  await page.click('text=Suivant');
  await checkEtape();
  await page.click('#cguAcceptees');
  await page.click('text=Valider');
});

const articlesCrisp = [
  'realiser-une-analyse-de-risques-de-la-securite-du-service',
  'lhomologation-simplifiee-identifier-la-demarche-adaptee',
  'tout-savoir-sur-lhomologation-de-securite',
  'lhomologation-simplifiee-les-grandes-etapes-vers-lhomologation',
  'lhomologation-simplifiee-perimetre-et-strategies-dhomologation-possibles',
  'lhomologation-simplifiee-quest-ce-quune-homologation-de-securite',
  'lhomologation-simplifiee-quand-homologuer-et-pour-quelle-duree',
  'realiser-un-audit-de-la-securite-du-service',
  'lhomologation-simplifiee-quels-sont-les-acteurs-de-lhomologation-de-securite',
  'lhomologation-simplifiee-pourquoi-homologuer',
  'lhomologation-simplifiee-les-facteurs-cles-de-succes',
  'je-narrive-a-homologuer-que-3-services-par-an',
  'jai-deja-oublie-de-renouveler-une-homologation',
  'la-securite-nest-pas-valorisee',
  'mon-fournisseur-de-service-me-dit-que-cest-securise',
  'je-ne-sais-pas-comment-constituer-un-dossier-dhomologation',
  'chiffrer-le-trafic-des-donnees-avec-un-certificat-de-securite-conforme-a-la-reglementation',
  'organiser-un-exercice-de-gestion-de-crise',
  'quelles-aides-sont-disponibles-pour-la-realisation-dune-homologation-de-securite',
  'activer-lauthentification-multifacteur-pour-lacces-des-administrateurs-au-service',
  'proteger-les-mots-de-passe-stockes-sur-le-service',
  'encourager-les-administrateurs-a-utiliser-un-coffre-fort-de-mots-de-passe',
  'fixer-des-contraintes-de-longueur-et-de-complexite-des-mots-de-passe',
  'mais-a-quoi-ca-sert-dhomologuer',
  'definir-une-politique-de-gestion-des-incidents-de-securite',
  'mais-qui-doit-etre-lautorite-dhomologation',
  'installer-un-certificat-de-signature-electronique-conforme-a-la-reglementation',
  'heberger-le-service-et-les-donnees-aupres-dun-prestataire-secnumcloud',
];

for (const article of articlesCrisp) {
  test(`L'article Crisp ${article} n'a aucune violation grave d'accessibilité`, async ({
    page,
  }) => {
    await page.goto(`/articles/${article}`);

    const problemes = await problemesDAccessibiliteDeLaPage(page);

    expect(problemes.length, messageDErreur(problemes)).toBe(0);
  });
}
