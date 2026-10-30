declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-preferences': CustomEvent;
  }
}

export type PreferencesProps = {
  consentements: Consentements;
  preferencesRecapitulatif: PreferencesRecapitulatif;
  peutGererPreferencesDuPerimetre: boolean;
};

export type Consentements = {
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
};

export type PreferencesRecapitulatif = RecapitulatifHebdomadaire &
  RecapitulatifMensuel;

export type RecapitulatifHebdomadaire = {
  mentionDansMesure: boolean;
  responsableMesure: boolean;
  echeanceMesureBientotExpiree: boolean;
  echeanceMesureExpiree: boolean;
};

export type RecapitulatifMensuel = {
  nouveauxServicesAjoutesAuPerimetre: boolean;
};
