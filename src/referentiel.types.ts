import donnees from '../donneesReferentiel.js';

export type IdStatutHomologation = keyof typeof donnees.statutsHomologation;
export type IdCategorieMesure = keyof typeof donnees.categoriesMesures;
export type IdCategorieRisque = keyof typeof donnees.categoriesRisques;
export type IdEcheanceRenouvellement =
  keyof typeof donnees.echeancesRenouvellement;
export type IdDelaiAvantImpactCritique =
  keyof typeof donnees.delaisAvantImpactCritique;
export type IdDonneeCaracterePersonnel =
  keyof typeof donnees.donneesCaracterePersonnel;
export type IdReferentielMesure =
  keyof typeof donnees.articlesDefinisReferentielsMesure;
export type IdFonctionnalite = keyof typeof donnees.fonctionnalites;
export type IdMesure = keyof typeof donnees.mesures;
export type IdNiveauGravite = keyof typeof donnees.niveauxGravite;
export type IdVraisemblanceRisque = keyof typeof donnees.vraisemblancesRisques;
export type IdRisque = keyof typeof donnees.risques;
export type IdStatutDeploiement = keyof typeof donnees.statutsDeploiement;
export type IdStatutMesure = keyof typeof donnees.statutsMesures;
export type IdLocalisationDonnees = keyof typeof donnees.localisationsDonnees;
export type IdTypeService = keyof typeof donnees.typesService;
export type IdEtapeHomologation =
  (typeof donnees.etapesParcoursHomologation)[number]['id'];
export type EtapeHomologation =
  (typeof donnees.etapesParcoursHomologation)[number];
export type IdTacheCompletudeProfil =
  (typeof donnees.tachesCompletudeProfil)[number]['id'];
export type IdEtapeVisiteGuidee = keyof typeof donnees.etapesVisiteGuidee;
export type IdNatureTacheService = keyof typeof donnees.naturesTachesService;
export type IdNatureSuggestionAction =
  keyof typeof donnees.naturesSuggestionsActions;
export type IdNiveauRisque = keyof typeof donnees.niveauxRisques;
export type IdNiveauSecurite = (typeof donnees.niveauxDeSecurite)[number];

export type DonneesReferentiel = {
  indiceCyber: {
    coefficientIndispensables: number;
    coefficientRecommandees: number;
    coefficientStatutPartiel: number;
    noteMax: number;
  };
} & Omit<typeof donnees, 'indiceCyber'>;
