import {
  repete,
  unAvis,
  uneCategorie,
  uneCriticite,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const commentaireLong = repete(
  'Les sauvegardes doivent être testées avant la mise en production.',
  10
);

const descriptionDeTroisLignes = repete(
  'Pour atteindre son objectif visé, un attaquant externe va compromettre',
  3
);

const donnees = unSupportDeCommission()
  .avecAutorite({ nom: 'Jean Dupond', fonction: 'RSSI' })
  .avecPieces(
    unePiece('Présent support de commission', {
      source: 'MonServiceSécurisé',
      cochee: true,
    }),
    unePiece('Charte informatique', { source: 'Utilisateur', cochee: false }),
    ...Array.from({ length: 18 }, (_, index) => unePiece(`Pièce ${index + 3}`))
  )
  .avecContexte({ description: repete('description', 20) })
  .avecBesoinsDeSecurite({
    idNiveau: 'niveau2',
    depasseRecommandation: false,
  })
  .avecExposition({
    ouverture:
      "Accessible à très peu de personnes en interne de l'organisation",
  })
  .avecDonneesIdentifiees(
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques'
  )
  .avecRisquesBruts(
    ...Array.from({ length: 9 }, (_, index) => unRisque(`R${index + 1}`))
  )
  .avecRisquesADate(
    ...Array.from({ length: 8 }, (_, index) =>
      unRisque(`R${index + 1}`, {
        gravite: 2,
        vraisemblance: 2,
        niveau: 'faible',
        description: descriptionDeTroisLignes,
      })
    )
  )
  .avecStatistiquesDesMesures({
    nombreDeMesuresGenerales: 1,
    nombreDeMesuresSpecifiques: 1,
    referentiels: "l'ANSSI",
  })
  .avecCategories(
    uneCategorie('Gouvernance', { fait: 19, aLancer: 2, aRemplir: 5 }),
    uneCategorie('Protection', {
      fait: 15,
      enCours: 2,
      nonFait: 3,
      aRemplir: 51,
    }),
    uneCategorie('Défense', { aRemplir: 10 })
  )
  .avecCriticites({
    indispensables: uneCriticite({
      fait: 2,
      enCours: 25,
      nonFait: 3,
      aLancer: 6,
      aRemplir: 14,
      restant: 48,
    }),
    recommandees: uneCriticite(),
  })
  .avecExigencesRestantes(
    ...[1, 2, 3, 4, 5, 6].map((numero) =>
      uneExigence(
        `Exigence ${numero} : documenter et autoriser uniquement les communications nécessaires via des règles de filtrage`
      )
    )
  )
  .avecAvis(
    unAvis('A'),
    unAvis('B'),
    unAvis('C'),
    unAvis('D', { commentaire: commentaireLong }),
    unAvis('E'),
    unAvis('F'),
    unAvis('G', { commentaire: commentaireLong })
  )
  .avecAnnexe({
    statut: 'fait',
    mesures: Array.from({ length: 12 }, (_, index) =>
      uneMesure(`Mesure ${index + 1}`)
    ),
  })
  .construis();

describe("Le support de commission d'homologation du groupe 2", () => {
  it('utilise les données', () => {
    expect(donnees).toEqual(donnees);
  });
});
