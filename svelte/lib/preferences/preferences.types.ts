declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-preferences': CustomEvent;
  }
}

export type PreferencesProps = {
  consentements: Consentements;
  recapitulatifHebdomadaire: RecapitulatifHebdomadaire;
};

export type Consentements = {
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
};

export type RecapitulatifHebdomadaire = {
  mentionDansMesure: boolean;
  responsableMesure: boolean;
};
