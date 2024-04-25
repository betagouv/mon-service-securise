declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-visite-guidee': CustomEvent;
  }
}

export type VisiteGuideeProps = {
  dejaTermine: boolean;
  etapeCourante: EtapeVisiteGuidee;
};

export type EtapeVisiteGuidee =
  | 'BIENVENUE'
  | 'PRESENTATION_MENU_NAV'
  | 'DECRIRE'
  | 'SECURISER'
  | 'HOMOLOGUER'
  | 'PILOTER';

type EtapeIndicateurEtape = {
  titre: string;
  icone: string;
  id: string;
};
export type ConfigurationIndicateurEtape = {
  etapes: EtapeIndicateurEtape[];
};
