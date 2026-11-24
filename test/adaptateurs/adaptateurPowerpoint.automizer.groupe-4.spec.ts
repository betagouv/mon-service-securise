import {
  repete,
  unAvis,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const unePieceAbregeable = (intitule: string) =>
  unePiece(intitule, {
    intituleAbrege: 'Avis écrits des collaborateurs',
    source: 'Utilisateur',
  });

const descriptionSurQuatreLignesDansPowerPoint = repete(
  "Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud",
  2,
  ''
);

const commentaireDe1000Caracteres = repete(
  'Les sauvegardes doivent être testées avant la mise en production.',
  16
).slice(0, 1000);

const donnees = unSupportDeCommission()
  .avecPieces(
    unePieceAbregeable(
      'Avis écrits de Jean Dupond, Marie Martin, Paul Durand, Sophie Bernard, Lucas Petit, Emma Moreau, Hugo Laurent, Léa Fournier, Nathan Girard et Chloé Garnier'
    ),
    unePiece('Pièce 2'),
    unePieceAbregeable(
      'Avis écrits de Jean Dupond, Marie Martin et Paul Durand'
    ),
    unePiece('Pièce 4')
  )
  .avecContexte({ description: repete('description', 60) })
  .avecDonneesIdentifiees(
    "Données d'identité",
    'Documents RH sensibles',
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques',
    'Plannings des agents',
    'Agendas des élus',
    'Comptes rendus de réunion'
  )
  .avecRisquesBruts(
    unRisque('R1', { gravite: 1, vraisemblance: 1, niveau: 'faible' }),
    unRisque('R2', { gravite: 4, vraisemblance: 1, niveau: 'moyen' }),
    unRisque('R3', { gravite: 4, vraisemblance: 4, niveau: 'eleve' }),
    unRisque('RS1', { gravite: 4, vraisemblance: 4, niveau: 'nonEvalue' })
  )
  .avecRisquesADate(
    unRisque('R1', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      intitule: repete('intitulé', 20),
      description: 'Courte',
    }),
    unRisque('R2', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      intitule: 'Court',
      description: repete('description', 40),
    })
  )
  .avecExigencesRestantes(
    uneExigence('Une mesure générale', {
      cartouches: ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
    }),
    uneExigence(`M 19 ${descriptionSurQuatreLignesDansPowerPoint}`, {
      cartouches: ['Mesures ajoutées', 'Protection'],
    })
  )
  .avecAvis(
    unAvis('Jean Dupond'),
    unAvis('Paul Martin', { commentaire: commentaireDe1000Caracteres }),
    unAvis('Sophie Bernard')
  )
  .avecAnnexe(
    { statut: 'fait', mesures: [uneMesure('Une mesure')] },
    { statut: 'enCours', mesures: [uneMesure('Seule mesure')] },
    {
      statut: 'aLancer',
      mesures: [uneMesure('Une mesure'), uneMesure('Une autre')],
    },
    { statut: 'sansStatut', mesures: [uneMesure('Une mesure')] }
  )
  .construis();

describe("Le support de commission d'homologation du groupe 4", () => {
  it('utilise les données', () => {
    expect(donnees).toEqual(donnees);
  });
});
