import {
  repete,
  uneExigence,
  uneMesure,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const intituleDe = (nombreDeLignes: number) =>
  repete("Compromission d'un poste de travail utilisateur", nombreDeLignes);

const donnees = unSupportDeCommission()
  .avecContexte({
    description: 'Premier paragraphe\n\n\n\nDernier paragraphe',
  })
  .avecDonneesIdentifiees(
    "Données d'identité",
    'Documents RH sensibles',
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques',
    'Plannings des agents'
  )
  .avecRisquesBruts(
    ...[1, 2, 3, 4].map((lignes) =>
      unRisque(`R${lignes}`, { intitule: intituleDe(lignes) })
    )
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('R2', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      description: repete('description', 40),
    }),
    unRisque('R3', { gravite: 2, vraisemblance: 2, niveau: 'faible' })
  )
  .avecExigencesRestantes(
    uneExigence('Une description courte', { statut: 'enCours' }),
    uneExigence(
      'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges',
      { statut: 'aLancer' }
    ),
    uneExigence('Une autre description courte')
  )
  .avecAvis()
  .avecAnnexe(
    {
      statut: 'fait',
      mesures: [
        uneMesure('Désigner un responsable de la sécurité'),
        uneMesure(
          'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges du système',
          {
            categorie: 'Protection',
            criticite: 'Recommandée',
            referentiel: 'CNIL',
          }
        ),
        uneMesure('Une autre description courte'),
      ],
    },
    { statut: 'sansStatut', mesures: [uneMesure('Journaliser les accès')] }
  )
  .construis();

describe("Le support de commission d'homologation du groupe 5", () => {
  it('utilise les données', () => {
    expect(donnees).toEqual(donnees);
  });
});
