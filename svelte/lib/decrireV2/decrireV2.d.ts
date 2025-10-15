declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decrire-v2': CustomEvent;
  }
}

export type DecrireV2Props = {
  service: Record<string, unknown>;
};
