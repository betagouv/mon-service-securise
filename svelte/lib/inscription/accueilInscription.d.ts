declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-accueil-inscription': CustomEvent;
  }
}

export type AccueilInscriptionProps = {
  invite: boolean;
};
