import type { Entite } from '../ui/types';
import type { DescriptionServiceV2 } from '../creationV2/creationV2.types';
import type { UUID } from '../typesBasiquesSvelte';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type DecrireV2Props = {
  descriptionService: DescriptionServiceV2API;
  lectureSeule: boolean;
};

export type DescriptionServiceV2API = {
  id: UUID;
  organisationResponsable: Entite;
  pointsAcces: { description: string }[];
} & Omit<DescriptionServiceV2, 'siret' | 'pointsAcces'>;
