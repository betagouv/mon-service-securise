declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-preferences': CustomEvent;
  }
}

export type PreferencesProps = {
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
};

export type Consentements = {
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
};
