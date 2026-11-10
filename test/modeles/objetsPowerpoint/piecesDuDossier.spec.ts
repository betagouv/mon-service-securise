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
      'Présent support de commission',
      'Décision d’homologation à signer',
      'Synthèse de la sécurité du service (MonServiceSécurisé)',
      'Rapport d’audit, si réalisé',
      'Analyse de risque, si réalisée',
    ]);
  });

  it('comprennent, en troisième position, les avis écrits des collaborateurs ayant renseigné les avis', () => {
    const dossier = unDossier(referentiel)
      .avecAvis([
        avisDe(['Jean Dupond', 'Marie Martin']),
        avisDe(['Paul Durand']),
      ])
      .construis();

    expect(piecesDuDossier(dossier)[2]).toBe(
      'Avis écrits de Jean Dupond, Marie Martin et Paul Durand'
    );
  });
});
