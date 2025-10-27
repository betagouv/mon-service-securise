import {
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  IdMesure,
  LocalisationDonneesTraitees,
  mesuresV2,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
} from '../donneesReferentielMesuresV2.js';
import { Referentiel } from './referentiel.interface.js';
import { creeReferentiel } from './referentiel.js';

type MethodesSpecifiquesReferentielV2 = {
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
};

type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
};

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { ...questionsV2, mesures: mesuresV2 }
): Referentiel & MethodesSpecifiquesReferentielV2 => {
  const localisationDonnees = (localisation: LocalisationDonneesTraitees) =>
    donnees.localisationDonneesTraitees[localisation];

  const typeService = (type: TypeDeService) => donnees.typeDeService[type];

  const descriptionStatutDeploiement = (statutDeploiement: StatutDeploiement) =>
    donnees.statutDeploiement[statutDeploiement].description;

  const descriptionSpecificiteProjet = (specificiteProjet: SpecificiteProjet) =>
    donnees.specificiteProjet[specificiteProjet].nom;

  const descriptionDelaiAvantImpactCritique = (
    delaiAvantImpactCritique: DureeDysfonctionnementAcceptable
  ) => donnees.dureeDysfonctionnementAcceptable[delaiAvantImpactCritique].nom;

  const descriptionsDonneesCaracterePersonnel = (
    donneesCaracterePersonnel: CategorieDonneesTraitees
  ) => donnees.categorieDonneesTraitees[donneesCaracterePersonnel].nom;

  const mesure = (idMesure: IdMesure) => donnees.mesures[idMesure];

  return {
    ...creeReferentiel(),
    descriptionDelaiAvantImpactCritique,
    descriptionsDonneesCaracterePersonnel,
    descriptionSpecificiteProjet,
    descriptionStatutDeploiement,
    localisationDonnees,
    mesure,
    typeService,
  };
};
