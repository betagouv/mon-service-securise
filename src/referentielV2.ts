import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  AudienceCible,
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
  OuvertureSysteme,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../donneesReferentielMesuresV2.js';
import {
  IdMesureV2,
  ReglesDuReferentielMesuresV2,
} from './moteurRegles/v2/moteurReglesV2.js';

export type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
};

type MethodesSpecifiquesReferentielV2 = {
  audienceCibleParNom: (n: NomAudienceCible) => AudienceCible;
  delaiAvantImpactCritiqueParDescription: (
    n: NomDureeDysfonctionnementAcceptable
  ) => DureeDysfonctionnementAcceptable;
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
  descriptionsAudienceCible: () => NomAudienceCible[];
  descriptionsOuvertureSysteme: () => NomOuvertureSysteme[];
  descriptionsTypeHebergement: () => NomTypeHebergement[];
  descriptionsVolumetrieDonneesTraitees: () => NomVolumetrieDonneesTraitees[];
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  localisationDonneesParDescription: (
    n: NomLocalisationDonneesTraitees
  ) => LocalisationDonneesTraitees;
  ouvertureSystemeParNom: (n: NomOuvertureSysteme) => OuvertureSysteme;
  statutDeploiementParDescription: (
    d: DescriptionStatutDeploiement
  ) => StatutDeploiement;
  typeHebergementParNom: (n: NomTypeHebergement) => TypeHebergement;
  typeServiceParDescription: (n: NomTypeDeService) => TypeDeService;
  volumetrieDonneesTraiteesParNom: (
    n: NomVolumetrieDonneesTraitees
  ) => VolumetrieDonneesTraitees;
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
};

type Surcharge<A, B> = Omit<A, keyof B> & B;

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { ...questionsV2, mesures: mesuresV2 }
): Surcharge<Referentiel, MethodesSpecifiquesReferentielV2> => {
  let reglesMoteurV2Enregistrees: ReglesDuReferentielMesuresV2 = [];
  const identifiantsMesure = new Set<string>(Object.keys(donnees.mesures));

  const nomsDonnees = <T>(d: Record<string, { nom: string }>): T =>
    Object.values(d).map((v) => v.nom) as T;
  const descriptionsDonnees = <T>(
    d: Record<string, { description: string }>
  ): T => Object.values(d).map((v) => v.description) as T;
  const identifiantDonneeParDescription = <
    T extends Record<string, { description: string }>,
  >(
    d: T,
    description: string
  ): keyof T =>
    Object.entries(d).find(
      ([, valeur]) => valeur.description === description
    )?.[0] as keyof T;
  const identifiantDonneeParNom = <T extends Record<string, { nom: string }>>(
    d: T,
    nom: string
  ): keyof T =>
    Object.entries(d).find(([, valeur]) => valeur.nom === nom)?.[0] as keyof T;

  const audienceCibleParNom = (nom: string) =>
    identifiantDonneeParNom(donnees.audienceCible, nom);

  const delaiAvantImpactCritiqueParDescription = (nom: string) =>
    identifiantDonneeParNom(donnees.dureeDysfonctionnementAcceptable, nom);

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

  const localisationDonneesParDescription = (nom: string) =>
    identifiantDonneeParNom(donnees.localisationDonneesTraitees, nom);

  const mesure = (idMesure: IdMesureV2) => donnees.mesures[idMesure];

  const ouvertureSystemeParNom = (nom: string) =>
    identifiantDonneeParNom(donnees.ouvertureSysteme, nom);

  const statutDeploiementParDescription = (
    d: DescriptionStatutDeploiement
  ): StatutDeploiement =>
    identifiantDonneeParDescription(donnees.statutDeploiement, d);

  const typeService = (type: TypeDeService) => donnees.typeDeService[type];

  const typeHebergementParNom = (nom: string) =>
    identifiantDonneeParNom(donnees.typeHebergement, nom);

  const typeServiceParDescription = (nom: string) =>
    identifiantDonneeParNom(donnees.typeDeService, nom);

  const volumetrieDonneesTraiteesParNom = (nom: string) =>
    identifiantDonneeParNom(donnees.volumetrieDonneesTraitees, nom);

  const reglesMoteurV2 = () => reglesMoteurV2Enregistrees;

  return {
    ...creeReferentiel(),
    audienceCibleParNom,
    delaiAvantImpactCritiqueParDescription,
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
    localisationDonneesParDescription,
    mesure,
    ouvertureSystemeParNom,
    statutDeploiementParDescription,
    typeHebergementParNom,
    typeService,
    typeServiceParDescription,
    volumetrieDonneesTraiteesParNom,
    reglesMoteurV2,
    version: () => 'v2',
  };
};
