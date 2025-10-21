import type { Entite } from '../ui/types';
import type {
  ActiviteExternalisee,
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  OuvertureSysteme,
  SpecificiteProjet,
  StatutDeploiement,
  TypeHebergement,
  TypeService,
  VolumetrieDonneesTraitees,
} from '../creationV2/creationV2.types';
import type { UUID } from '../typesBasiquesSvelte';
import type { NiveauSecurite } from '../../../donneesReferentielMesuresV2';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type DecrireV2Props = {
  descriptionService: DescriptionServiceV2API;
  lectureSeule: boolean;
  idService: UUID;
};

export type DescriptionServiceV2API = {
  organisationResponsable: Entite;
  pointsAcces: { description: string }[];
  nomService: string;
  statutDeploiement: StatutDeploiement;
  presentation: string;
  typeService: TypeService[];
  specificitesProjet: SpecificiteProjet[];
  typeHebergement: TypeHebergement;
  activitesExternalisees: ActiviteExternalisee[];
  ouvertureSysteme: OuvertureSysteme;
  audienceCible: AudienceCible;
  dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable;
  categoriesDonneesTraitees: CategorieDonneesTraitees[];
  categoriesDonneesTraiteesSupplementaires: string[];
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  localisationsDonneesTraitees: LocalisationDonneesTraitees[];
  niveauSecurite: NiveauSecurite;
};
