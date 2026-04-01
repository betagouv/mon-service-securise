declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-menu-navigation-service': CustomEvent;
  }
}

export type EtapeService =
  | 'contactsUtiles'
  | 'risques'
  | 'descriptionService'
  | 'mesures'
  | 'dossiers';

export type MenuNavigationServiceProps = {
  idService: string;
  etapeActive: EtapeService;
  visible: Record<EtapeService, boolean>;
  modeVisiteGuidee: boolean;
};
