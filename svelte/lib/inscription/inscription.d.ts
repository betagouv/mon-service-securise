declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-inscription': CustomEvent;
  }
}

export type InscriptionProps = {};
