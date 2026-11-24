import {
  unAvis,
  uneCategorie,
  uneCriticite,
  uneExigence,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const donnees = unSupportDeCommission()
  .avecContexte({
    description:
      'Un portail de démarches en ligne\n\nOuvert aux usagers de la commune',
    organisation: 'Commune de Saint-Ours (987 654 321 00020)',
    statut: 'En conception',
    urls: 'https://rh.exemple.fr',
    typeDeProjet: 'Application mobile',
    hebergement: 'Autre',
    donneesStockees: "En partie ou totalement hors de l'Union européenne",
    securisations: 'Un annuaire',
  })
  .avecBesoinsDeSecurite({
    idNiveau: 'niveau1',
    niveau: 'Modérés',
    resume: 'Les besoins de sécurité sont modérés.',
    demarche: 'intermédiaire',
    niveauIndicatifAnssi: 'Basiques',
    depasseRecommandation: true,
    nomService: 'Portail des démarches',
  })
  .avecExposition({
    ouverture: 'Accessible depuis internet',
    audience: "Large : Utilisé à l'échelle nationale.",
    dureeDysfonctionnement: 'Moins de 4h',
  })
  .avecDonneesIdentifiees(
    'Données techniques',
    'Agendas',
    'Documents RH sensibles'
  )
  .avecRisquesBruts(
    unRisque('R3', { gravite: 4, vraisemblance: 4 }),
    unRisque('R7', { gravite: 4, vraisemblance: 4 }),
    unRisque('RS1', { gravite: 2, vraisemblance: 1 })
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('RS1', { gravite: 2, vraisemblance: 2, niveau: 'faible' })
  )
  .avecRisquesCibles(unRisque('R3', { niveau: 'eleve' }))
  .avecIndiceCyber({
    nomService: 'Mon service',
    total: 2.43,
    totalPersonnalise: 2.6,
    noteMax: 5,
    categories: [
      { libelle: 'Gouvernance', note: 3.2 },
      { libelle: 'Protection', note: 1.8 },
    ],
    referentiels: "l'ANSSI et la CNIL",
  })
  .avecStatistiquesDesMesures({
    nombreDeMesuresGenerales: 113,
    nombreDeMesuresSpecifiques: 4,
    referentiels: "l'ANSSI et la CNIL",
  })
  .avecCategories(
    uneCategorie('Gouvernance', { fait: 19, aLancer: 2, aRemplir: 5 }),
    uneCategorie('Protection', {
      fait: 15,
      enCours: 2,
      nonFait: 3,
      aRemplir: 51,
    }),
    uneCategorie('Défense', { aRemplir: 10 }),
    uneCategorie('Résilience', {
      fait: 1,
      enCours: 1,
      aLancer: 1,
      aRemplir: 2,
    })
  )
  .avecCriticites({
    indispensables: uneCriticite({ restant: 48 }),
    recommandees: uneCriticite({ restant: 1 }),
  })
  .avecExigencesRestantes(
    uneExigence('Identifier les engagements des prestataires', {
      statut: 'enCours',
      echeance: '31/12/2026',
      porteurs: 'Équipe projet et prestataire',
    }),
    uneExigence('Tester la restauration des sauvegardes', {
      statut: 'aLancer',
    })
  )
  .avecAvis(
    unAvis('Jean Dupond', {
      avis: 'Favorable',
      commentaire: 'Ok\n\nÀ revoir',
    }),
    unAvis('Ludmilla Cara, Thomas Berthelot', {
      avis: 'Favorable avec réserve : mettre en place le MFA',
      duree: '6 mois',
    })
  )
  .construis();

describe("Le support de commission d'homologation du groupe 1", () => {
  it('utilise les données', () => {
    expect(donnees).toEqual(donnees);
  });
});
