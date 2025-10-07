import type {
  NiveauSecurite,
  questionsV2,
} from '../../../donneesReferentielMesuresV2.js';
import type { UUID } from '../typesBasiquesSvelte.js';

export type StatutDeploiement = keyof typeof questionsV2.statutDeploiement;
export type TypeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;
export type ActiviteExternalisee =
  keyof typeof questionsV2.activiteExternalisee;
export type OuvertureSysteme = keyof typeof questionsV2.ouvertureSysteme;
export type AudienceCible = keyof typeof questionsV2.audienceCible;
export type DureeDysfonctionnementAcceptable =
  keyof typeof questionsV2.dureeDysfonctionnementAcceptable;
export type CategorieDonneesTraitees =
  keyof typeof questionsV2.categorieDonneesTraitees;
export type VolumetrieDonneesTraitees =
  keyof typeof questionsV2.volumetrieDonneesTraitees;
export type LocalisationDonneesTraitees =
  keyof typeof questionsV2.localisationDonneesTraitees;

// Côté HTTP, on n'est pas sûr d'avoir les propriétés,
// puisque le brouillon est enregistré au fil de l'eau
export type BrouillonIncomplet = {
  id?: UUID;
  nomService?: string;
  siret?: string;
  statutDeploiement?: StatutDeploiement;
  presentation?: string;
  pointsAcces?: string[];
  typeService?: TypeService[];
  specificitesProjet?: SpecificiteProjet[];
  typeHebergement?: TypeHebergement;
  activitesExternalisees?: ActiviteExternalisee[];
  ouvertureSysteme?: OuvertureSysteme;
  audienceCible?: AudienceCible;
  dureeDysfonctionnementAcceptable?: DureeDysfonctionnementAcceptable;
  categoriesDonneesTraitees?: CategorieDonneesTraitees[];
  categoriesDonneesTraiteesSupplementaires?: string[];
  volumetrieDonneesTraitees?: VolumetrieDonneesTraitees;
  localisationsDonneesTraitees?: LocalisationDonneesTraitees[];
  niveauSecurite?: NiveauSecurite;
};

// Côté Svelte, on VEUT toujours toutes les propriétés,
// pour faire fonctionner correctement l'UI
export type BrouillonSvelte = {
  id?: UUID;
  nomService: string;
  siret: string;
  statutDeploiement: StatutDeploiement | '';
  presentation: string;
  pointsAcces: string[];
  typeService: TypeService[];
  specificitesProjet: SpecificiteProjet[];
  typeHebergement: TypeHebergement | '';
  activitesExternalisees: ActiviteExternalisee[];
  ouvertureSysteme: OuvertureSysteme | '';
  audienceCible: AudienceCible | '';
  dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable | '';
  categoriesDonneesTraitees: CategorieDonneesTraitees[];
  categoriesDonneesTraiteesSupplementaires: string[];
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees | '';
  localisationsDonneesTraitees: LocalisationDonneesTraitees[];
  niveauSecurite: NiveauSecurite | '';
};
