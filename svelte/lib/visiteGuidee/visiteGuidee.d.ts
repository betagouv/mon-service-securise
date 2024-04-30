declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-visite-guidee': CustomEvent;
  }
}

export type VisiteGuideeProps = {
  dejaTermine: boolean;
  etapeCourante: EtapeVisiteGuidee;
  nombreEtapesRestantes: number;
  etapesVues: EtapeVisiteGuidee[];
};

export type EtapeVisiteGuidee =
  | 'BIENVENUE'
  | 'PRESENTATION_MENU_NAV'
  | 'DECRIRE'
  | 'SECURISER'
  | 'HOMOLOGUER'
  | 'PILOTER'
  | 'MASQUE';

type EtapeIndicateurEtape = {
  titre: string;
  icone: string;
  id: EtapeVisiteGuidee;
  lien?: string;
};
export type ConfigurationIndicateurEtape = {
  etapes: EtapeIndicateurEtape[];
};
