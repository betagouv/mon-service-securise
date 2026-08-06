import type { ReferentielPagesService } from '../pagesService/pagesService';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-visite-guidee-spa': CustomEvent;
  }
}

export type VisiteGuideeSPAProps = {
  referentiel: ReferentielPagesService;
  featureFlags: {
    avecRisquesV2: boolean;
  };
  nonce: string;
};

export type PageFondVisiteGuidee =
  | 'tableauDeBord'
  | 'creationV2'
  | 'besoinsSecuriteV2'
  | 'mesures'
  | 'dossiers';
