import type { Entite } from '../ui/types';
import type { DescriptionServiceV2 } from '../creationV2/creationV2.types';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type DescriptionServiceV2API = {
  organisationResponsable: Entite;
  pointsAcces: { description: string }[];
} & DescriptionServiceV2;

export type DecrireV2Props = {
  descriptionService: DescriptionServiceV2API;
};
