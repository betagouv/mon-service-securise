declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-preferences': CustomEvent;
  }
}

export type PreferencesProps = {
  consentements: Consentements;
};

export type Consentements = {
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
};
