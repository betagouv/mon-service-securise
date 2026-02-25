import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  AudienceCible,
  CategorieDonneesTraitees,
  DetailReferentielMesureV2,
  DureeDysfonctionnementAcceptable,
  IdMesureV2,
  LocalisationDonneesTraitees,
  mesuresV2,
  OuvertureSysteme,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
} from '../donneesReferentielMesuresV2.js';
import { ReglesDuReferentielMesuresV2 } from './moteurRegles/v2/moteurReglesV2.js';
import {
  DonneesComplementairesMesuresV2,
  donneesComplementairesMesureV2,
} from '../donneesComplementairesReferentielMesuresV2.js';
import { TypeService } from '../svelte/lib/creationV2/creationV2.types.js';

export type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
  donneesComplementairesMesures: DonneesComplementairesMesuresV2;
};

type MethodesSpecifiquesReferentielV2 = {
  ajouteThematiqueEtPorteurs: (mesures: typeof mesuresV2) => typeof mesuresV2;
  descriptionAudienceCible: (audienceCible: AudienceCible) => string;
  descriptionDelaiAvantImpactCritique: (
    dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable
  ) => string;
  descriptionsDonneesCaracterePersonnel: (
    donneesCaracterePersonnel: CategorieDonneesTraitees
  ) => string;
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
  descriptionStatutDeploiement: (
    statutDeploiement: StatutDeploiement
  ) => string;
  descriptionTypeHebergement: (typeHebergement: TypeHebergement) => string;
  descriptionTypeService: (typeService: TypeService) => string;
  descriptionOuvertureSysteme: (ouvertureSysteme: OuvertureSysteme) => string;
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  localisationDonnees: (localisation: LocalisationDonneesTraitees) => {
    nom: string;
  };
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
  mesures: () => typeof mesuresV2;
  mesure: (idMesure: IdMesureV2) => DetailReferentielMesureV2;
  porteursSinguliersDeMesure: (idMesure: IdMesureV2) => string[];
  thematiqueDeMesure: (idMesure: IdMesureV2) => string;
  typeService: (type: TypeDeService) => { nom: string; exemple: string };
};

type Surcharge<A, B> = Omit<A, keyof B> & B;

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = {
    ...questionsV2,
    mesures: mesuresV2,
    donneesComplementairesMesures: donneesComplementairesMesureV2,
  }
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

  const descriptionAudienceCible = (audienceCible: AudienceCible) =>
    `${donnees.audienceCible[audienceCible].nom} : ${donnees.audienceCible[audienceCible].description}`;

  const descriptionSpecificiteProjet = (specificiteProjet: SpecificiteProjet) =>
    donnees.specificiteProjet[specificiteProjet].nom;

  const descriptionStatutDeploiement = (statutDeploiement: StatutDeploiement) =>
    donnees.statutDeploiement[statutDeploiement].description;

  const descriptionTypeHebergement = (typeHebergement: TypeHebergement) =>
    donnees.typeHebergement[typeHebergement].nom;

  const descriptionTypeService = (typeService: TypeDeService) =>
    donnees.typeDeService[typeService].nom;

  const descriptionOuvertureSysteme = (ouvertureSysteme: OuvertureSysteme) =>
    donnees.ouvertureSysteme[ouvertureSysteme].nom;

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
    donnees.donneesComplementairesMesures[idMesure].porteursSinguliers;

  const thematiqueDeMesure = (idMesure: IdMesureV2) =>
    donnees.donneesComplementairesMesures[idMesure].thematique;

  const ajouteThematiqueEtPorteurs = (desMesures: typeof mesuresV2) =>
    Object.fromEntries(
      Object.entries(desMesures).map(([id, m]) => {
        const thematique = thematiqueDeMesure(id);
        const porteursSinguliers = porteursSinguliersDeMesure(id);
        return [id, { ...m, thematique, porteursSinguliers }];
      })
    );

  return {
    ...creeReferentiel(),
    ajouteThematiqueEtPorteurs,
    descriptionAudienceCible,
    descriptionDelaiAvantImpactCritique,
    descriptionsDonneesCaracterePersonnel,
    descriptionSpecificiteProjet,
    descriptionStatutDeploiement,
    descriptionTypeHebergement,
    descriptionTypeService,
    descriptionOuvertureSysteme,
    enregistreReglesMoteurV2,
    estIdentifiantMesureConnu,
    localisationDonnees,
    mesure,
    mesures,
    porteursSinguliersDeMesure,
    typeService,
    reglesMoteurV2,
    thematiqueDeMesure,
    version: () => 'v2',
  };
};
