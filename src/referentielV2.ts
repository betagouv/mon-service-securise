import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  IdMesureV2,
  LocalisationDonneesTraitees,
  mesuresV2,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
} from '../donneesReferentielMesuresV2.js';
import { ReglesDuReferentielMesuresV2 } from './moteurRegles/v2/moteurReglesV2.js';

export type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
  porteursSinguliersMesuresGenerales?: Record<IdMesureV2, string[]>;
};

type MethodesSpecifiquesReferentielV2 = {
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
  mesures: () => typeof mesuresV2;
  porteursSinguliersDeMesure: (idMesure: IdMesureV2) => string[];
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

  const mesures = () => structuredClone(donnees.mesures);

  const typeService = (type: TypeDeService) => donnees.typeDeService[type];

  const reglesMoteurV2 = () => reglesMoteurV2Enregistrees;

  const porteursSinguliersDeMesure = (idMesure: IdMesureV2) =>
    donnees.porteursSinguliersMesuresGenerales?.[idMesure] || [];

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
    mesures,
    porteursSinguliersDeMesure,
    typeService,
    reglesMoteurV2,
    version: () => 'v2',
  };
};
