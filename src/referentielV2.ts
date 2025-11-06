import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  mesuresV2,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
} from '../donneesReferentielMesuresV2.js';
import {
  IdMesureV2,
  ReglesDuReferentielMesuresV2,
} from './moteurRegles/v2/moteurReglesV2.js';

export type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
};

type MethodesSpecifiquesReferentielV2 = {
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
};

type Surcharge<A, B> = Omit<A, keyof B> & B;

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { ...questionsV2, mesures: mesuresV2 }
): Surcharge<Referentiel, MethodesSpecifiquesReferentielV2> => {
  let reglesMoteurV2Enregistrees: ReglesDuReferentielMesuresV2 = [];
  const identifiantsMesure = new Set<string>(Object.keys(donnees.mesures));

  const descriptionDelaiAvantImpactCritique = (
    dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable
  ) =>
    donnees.dureeDysfonctionnementAcceptable[dureeDysfonctionnementAcceptable]
      .nom;

  const descriptionsDonneesCaracterePersonnel = (
    donneesCaracterePersonnel: CategorieDonneesTraitees
  ) => donnees.categorieDonneesTraitees[donneesCaracterePersonnel].nom;

  const descriptionSpecificiteProjet = (specificiteProjet: SpecificiteProjet) =>
    donnees.specificiteProjet[specificiteProjet].nom;

  const descriptionStatutDeploiement = (statutDeploiement: StatutDeploiement) =>
    donnees.statutDeploiement[statutDeploiement].description;

  const enregistreReglesMoteurV2 = (regles: ReglesDuReferentielMesuresV2) => {
    reglesMoteurV2Enregistrees = regles;
  };

  const estIdentifiantMesureConnu = (id: IdMesureV2) =>
    identifiantsMesure.has(id);

  const localisationDonnees = (localisation: LocalisationDonneesTraitees) =>
    donnees.localisationDonneesTraitees[localisation];

  const mesure = (idMesure: IdMesureV2) => donnees.mesures[idMesure];

  const typeService = (type: TypeDeService) => donnees.typeDeService[type];

  const reglesMoteurV2 = () => reglesMoteurV2Enregistrees;

  return {
    ...creeReferentiel(),
    descriptionDelaiAvantImpactCritique,
    descriptionsDonneesCaracterePersonnel,
    descriptionSpecificiteProjet,
    descriptionStatutDeploiement,
    enregistreReglesMoteurV2,
    estIdentifiantMesureConnu,
    localisationDonnees,
    mesure,
    typeService,
    reglesMoteurV2,
    version: () => 'v2',
  };
};
