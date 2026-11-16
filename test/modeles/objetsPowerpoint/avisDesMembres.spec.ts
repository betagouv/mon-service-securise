import { avisDesMembres } from '../../../src/modeles/objetsPowerpoint/avisDesMembres.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { creeReferentielVide } from '../../../src/referentiel.js';
import {
  IdEcheanceRenouvellement,
  IdStatutAvis,
} from '../../../src/referentiel.types.ts';

describe('Les avis formalisés des membres présentés à la commission', () => {
  const referentiel = creeReferentielVide();
  referentiel.recharge({
    echeancesRenouvellement: {
      sixMois: { description: '6 mois' },
      unAn: { description: '1 an' },
    },
    statutsAvisDossierHomologation: {
      favorable: { description: 'Favorable' },
      defavorable: { description: 'Défavorable' },
    },
  });

  it('donnent pour chaque avis les membres, l’avis, la durée proposée et le commentaire', () => {
    const dossier = unDossier(referentiel)
      .avecAvis([
        {
          collaborateurs: ['Jean Dupont, RSSI', 'Marie Martin, DPO'],
          statut: 'favorable' as IdStatutAvis,
          dureeValidite: 'unAn' as IdEcheanceRenouvellement,
          commentaires: 'Sous réserve de la MFA',
        },
        {
          collaborateurs: ['Paul Durand'],
          statut: 'defavorable' as IdStatutAvis,
          dureeValidite: 'sixMois' as IdEcheanceRenouvellement,
        },
      ])
      .construis();

    expect(avisDesMembres(dossier, referentiel)).toEqual([
      {
        membres: 'Jean Dupont, RSSI, Marie Martin, DPO',
        avis: 'Favorable',
        duree: '1 an',
        commentaire: 'Sous réserve de la MFA',
      },
      {
        membres: 'Paul Durand',
        avis: 'Défavorable',
        duree: '6 mois',
        commentaire: '',
      },
    ]);
  });
});
