import type { questionsV2 } from '../../../donneesReferentielMesuresV2';

export type TypeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;

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
};
