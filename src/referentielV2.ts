import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  CategorieDonneesTraitees,
  DescriptionStatutDeploiement,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  mesuresV2,
  NomAudienceCible,
  NomDureeDysfonctionnementAcceptable,
  NomLocalisationDonneesTraitees,
  NomOuvertureSysteme,
  NomTypeDeService,
  NomTypeHebergement,
  NomVolumetrieDonneesTraitees,
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
  descriptionsAudienceCible: () => NomAudienceCible[];
  descriptionsOuvertureSysteme: () => NomOuvertureSysteme[];
  descriptionsTypeHebergement: () => NomTypeHebergement[];
  descriptionsVolumetrieDonneesTraitees: () => NomVolumetrieDonneesTraitees[];
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
};

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { ...questionsV2, mesures: mesuresV2 }
): Referentiel & MethodesSpecifiquesReferentielV2 => {
  let reglesMoteurV2Enregistrees: ReglesDuReferentielMesuresV2 = [];
  const identifiantsMesure = new Set<string>(Object.keys(donnees.mesures));

  const nomsDonnees = <T>(d: Record<string, { nom: string }>): T =>
    Object.values(d).map((v) => v.nom) as T;
  const descriptionsDonnees = <T>(
    d: Record<string, { description: string }>
  ): T => Object.values(d).map((v) => v.description) as T;

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

  const descriptionsAudienceCible = (): NomAudienceCible[] =>
    nomsDonnees(donnees.audienceCible) as NomAudienceCible[];

  const descriptionsDelaiAvantImpactCritique =
    (): NomDureeDysfonctionnementAcceptable[] =>
      nomsDonnees(donnees.dureeDysfonctionnementAcceptable);

  const descriptionLocalisationDonnees = (): NomLocalisationDonneesTraitees[] =>
    nomsDonnees(donnees.localisationDonneesTraitees);

  const descriptionsOuvertureSysteme = (): NomOuvertureSysteme[] =>
    nomsDonnees(donnees.ouvertureSysteme);

  const descriptionsStatutDeploiement = (): DescriptionStatutDeploiement[] =>
    descriptionsDonnees(donnees.statutDeploiement);

  const descriptionsTypeHebergement = (): NomTypeHebergement[] =>
    nomsDonnees(donnees.typeHebergement);

  const descriptionsTypeService = (): NomTypeDeService[] =>
    nomsDonnees(donnees.typeDeService);

  const descriptionsVolumetrieDonneesTraitees =
    (): NomVolumetrieDonneesTraitees[] =>
      nomsDonnees(donnees.volumetrieDonneesTraitees);

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
    descriptionsAudienceCible,
    descriptionsDelaiAvantImpactCritique,
    descriptionLocalisationDonnees,
    descriptionsOuvertureSysteme,
    descriptionsStatutDeploiement,
    descriptionsTypeHebergement,
    descriptionsTypeService,
    descriptionsVolumetrieDonneesTraitees,
    enregistreReglesMoteurV2,
    estIdentifiantMesureConnu,
    localisationDonnees,
    mesure,
    typeService,
    reglesMoteurV2,
    version: () => 'v2',
  };
};
