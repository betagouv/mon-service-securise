import {
  AudienceCible,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  OuvertureSysteme,
  questionsV2,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.js';

export type DescriptionStatutDeploiement =
  (typeof questionsV2.statutDeploiement)[StatutDeploiement]['description'];
export type NomTypeDeService =
  (typeof questionsV2.typeDeService)[TypeDeService]['nom'];
export type NomTypeHebergement =
  (typeof questionsV2.typeHebergement)[TypeHebergement]['nom'];
export type NomOuvertureSysteme =
  (typeof questionsV2.ouvertureSysteme)[OuvertureSysteme]['nom'];
export type NomAudienceCible =
  (typeof questionsV2.audienceCible)[AudienceCible]['nom'];
export type NomDureeDysfonctionnementAcceptable =
  (typeof questionsV2.dureeDysfonctionnementAcceptable)[DureeDysfonctionnementAcceptable]['nom'];
export type NomVolumetrieDonneesTraitees =
  (typeof questionsV2.volumetrieDonneesTraitees)[VolumetrieDonneesTraitees]['nom'];
export type NomLocalisationDonneesTraitees =
  (typeof questionsV2.localisationDonneesTraitees)[LocalisationDonneesTraitees]['nom'];

export const trouveIdentifiantDonneeParDescription = <
  T extends Record<string, { description: string }>,
>(
  d: T,
  description: string
): keyof T =>
  Object.entries(d).find(
    ([, valeur]) => valeur.description === description
  )?.[0] as keyof T;

export const trouveIdentifiantDonneeParNom = <
  T extends Record<string, { nom: string }>,
>(
  d: T,
  nom: string
): keyof T =>
  Object.entries(d).find(([, valeur]) => valeur.nom === nom)?.[0] as keyof T;
