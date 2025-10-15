import type { DescriptionServiceV2, Entite } from '../ui/types';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type ServiceV2 = {
  descriptionService: {
    organisationResponsable: Entite;
    pointsAcces: { description: string }[];
  } & DescriptionServiceV2;
};

export type DecrireV2Props = {
  service: ServiceV2;
};
