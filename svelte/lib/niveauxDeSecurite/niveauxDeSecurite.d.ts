declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-niveaux-de-securite': CustomEvent;
  }
}

export type NiveauxDeSecuriteProps = {};
