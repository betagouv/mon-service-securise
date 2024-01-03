declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-completude-mesure': CustomEvent;
  }
}

export type CompletudeMesureProps = {
  progression: number;
};
