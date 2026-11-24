import {
  repete,
  unAvis,
  uneCriticite,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const intituleDeTroisLignes = repete(
  "Compromission d'un poste de travail utilisateur",
  3
);

const descriptionSurQuatreLignes =
  "Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud, puis vérifier régulièrement que le prestataire respecte ses engagements contractuels, notamment en matière de localisation des données et de réversibilité";

const unCommentaireSur = (lignes: number) => repete('Une ligne', lignes, '\n');

const donnees = unSupportDeCommission()
  .avecPieces(
    ...Array.from({ length: 16 }, (_, index) => unePiece(`Pièce ${index + 1}`))
  )
  .avecContexte({ description: repete('description', 35) })
  .avecDonneesIdentifiees(
    'Données techniques',
    'Documents RH sensibles',
    "Données d'identité",
    'Plannings des agents',
    'Données sensibles'
  )
  .avecRisquesBruts(
    ...Array.from({ length: 8 }, (_, index) =>
      unRisque(`R${index + 1}`, { intitule: intituleDeTroisLignes })
    )
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('R2', { gravite: 2, vraisemblance: 2, niveau: 'moyen' }),
    unRisque('R3', { gravite: 2, vraisemblance: 2, niveau: 'eleve' }),
    unRisque('RS1', { gravite: 2, vraisemblance: 2, niveau: 'nonEvalue' })
  )
  .avecCriticites({
    indispensables: uneCriticite({ fait: 3, restant: 0 }),
    recommandees: uneCriticite({ aRemplir: 4, restant: 4 }),
  })
  .avecExigencesRestantes(
    ...[1, 2, 3, 4, 5, 6].map((numero) => uneExigence(`Exigence ${numero}`))
  )
  .avecAvis(
    ...[11, 12, 13, 14].map((lignes) =>
      unAvis('Jean Dupond', { commentaire: unCommentaireSur(lignes) })
    ),
    unAvis('Paul Martin')
  )
  .avecAnnexe({
    statut: 'fait',
    mesures: Array.from({ length: 5 }, () =>
      uneMesure(descriptionSurQuatreLignes)
    ),
  })
  .construis();

describe("Le support de commission d'homologation du groupe 3", () => {
  it('utilise les données', () => {
    expect(donnees).toEqual(donnees);
  });
});
