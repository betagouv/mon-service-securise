import type { DescriptionServiceV2 } from '../ui/types';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type ServiceV2 = {
  descriptionService: {
    organisationResponsable: {
      siret: string;
    };
    pointsAcces: { description: string }[];
  } & DescriptionServiceV2;
};

export type DecrireV2Props = {
  service: ServiceV2;
};
