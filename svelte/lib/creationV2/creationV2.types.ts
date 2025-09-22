import type { questionsV2 } from '../../../donneesReferentielMesuresV2';

export type TypeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;
export type ActiviteeExternalisee = keyof typeof questionsV2.typeHebergement;
export type OuvertureSysteme = keyof typeof questionsV2.ouvertureSysteme;
export type AudienceCible = keyof typeof questionsV2.audienceCible;
export type DureeDysfonctionnementAcceptable =
  keyof typeof questionsV2.dureeDysfonctionnementAcceptable;

// Côté HTTP, on n'est pas sûr d'avoir les propriétés,
// puisque le brouillon est enregistré au fil de l'eau
export type BrouillonIncomplet = {
  nomService?: string;
  siret?: string;
  statutDeploiement?: string;
  presentation?: string;
  pointsAcces?: string[];
  typeService?: TypeService[];
  specificitesProjet?: SpecificiteProjet[];
  typeHebergement?: TypeHebergement;
  activitesExternalisees?: ActiviteeExternalisee[];
  ouvertureSysteme?: OuvertureSysteme;
  audienceCible?: AudienceCible;
  dureeDysfonctionnementAcceptable?: DureeDysfonctionnementAcceptable;
};

// Côté Svelte, on VEUT toujours toutes les propriétés,
// pour faire fonctionner correctement l'UI
export type BrouillonSvelte = {
  nomService: string;
  siret: string;
  statutDeploiement: string;
  presentation: string;
  pointsAcces: string[];
  typeService: TypeService[];
  specificitesProjet: SpecificiteProjet[];
  typeHebergement: TypeHebergement | '';
  activitesExternalisees: ActiviteeExternalisee[];
  ouvertureSysteme: OuvertureSysteme | '';
  audienceCible: AudienceCible | '';
  dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable | '';
};
