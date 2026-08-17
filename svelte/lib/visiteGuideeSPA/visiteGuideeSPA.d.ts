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
  | 'risques'
  | 'mesures'
  | 'dossiers';

export type EtapeVisiteGuidee = 1 | 2 | 3 | 4;

export type EtapeVisiteGuideeAdditionnelle =
  | 'contributeurs'
  | 'liste-mesures'
  | 'televersement'
  | 'organisations';

export type DecoupeVisiteGuidee = {
  marge: number;
  rayon: number;
};

export type PositionModale = 'bas' | 'droite';

export type RectCible = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type DonneesEtapeVisiteGuidee = {
  pageFond: PageFondVisiteGuidee;
  titre: string;
  description: string;
  ouverture: () => HTMLElement;
  callbackAvantOuverture?: () => Promise<void>;
  decoupe?: DecoupeVisiteGuidee;
  positionModale: PositionModale;
  decalageModale?: number;
  tiroirOuvert?: TiroirTeleversementServicesV2 | Mesure;
};
