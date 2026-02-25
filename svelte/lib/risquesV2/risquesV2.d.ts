declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques-v2': CustomEvent;
  }
}

export type RisquesV2Props = {
  idService: string;
};
