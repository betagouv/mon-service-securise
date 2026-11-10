import { piecesDuDossier } from '../../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { creeReferentielVide } from '../../../src/referentiel.js';
import {
  IdEcheanceRenouvellement,
  IdStatutAvis,
} from '../../../src/referentiel.types.ts';

describe('Les pièces du dossier transmises avant la commission', () => {
  const referentiel = creeReferentielVide();
  referentiel.recharge({
    echeancesRenouvellement: { unAn: {} },
    statutsAvisDossierHomologation: { favorable: {} },
  });

  const avisDe = (collaborateurs: string[]) => ({
    collaborateurs,
    statut: 'favorable' as IdStatutAvis,
    dureeValidite: 'unAn' as IdEcheanceRenouvellement,
  });

  it('comprennent toujours le support, la décision, la synthèse, le rapport d’audit et l’analyse de risque', () => {
    const dossierSansAvis = unDossier(referentiel).construis();

    expect(piecesDuDossier(dossierSansAvis)).toEqual([
      {
        intitule: 'Présent support de commission',
        source: 'MonServiceSécurisé',
        cochee: true,
      },
      {
        intitule: 'Décision d’homologation à signer',
        source: 'MonServiceSécurisé',
        cochee: true,
      },
      {
        intitule: 'Synthèse de la sécurité du service (MonServiceSécurisé)',
        source: 'MonServiceSécurisé',
        cochee: false,
      },
      {
        intitule: 'Rapport d’audit, si réalisé',
        source: 'MonServiceSécurisé',
        cochee: false,
      },
      {
        intitule: 'Analyse de risque, si réalisée',
        source: 'MonServiceSécurisé',
        cochee: false,
      },
    ]);
  });

  it('comprennent, en troisième position, les avis écrits des collaborateurs ayant renseigné les avis', () => {
    const dossier = unDossier(referentiel)
      .avecAvis([
        avisDe(['Jean Dupond', 'Marie Martin']),
        avisDe(['Paul Durand']),
      ])
      .construis();

    expect(piecesDuDossier(dossier)[2]).toEqual({
      intitule: 'Avis écrits de Jean Dupond, Marie Martin et Paul Durand',
      source: 'MonServiceSécurisé',
      cochee: false,
    });
  });

  it('se terminent par les documents ajoutés au dossier par l’utilisateur', () => {
    const dossier = unDossier(referentiel)
      .avecDocuments(['Charte informatique', 'Contrat d’hébergement'])
      .construis();

    expect(piecesDuDossier(dossier).slice(-2)).toEqual([
      { intitule: 'Charte informatique', source: 'Utilisateur', cochee: false },
      {
        intitule: 'Contrat d’hébergement',
        source: 'Utilisateur',
        cochee: false,
      },
    ]);
  });
});
