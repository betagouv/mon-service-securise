declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-observatoire': CustomEvent;
  }
}

export type ObservatoireProps = {
  totalServices: number;
};
