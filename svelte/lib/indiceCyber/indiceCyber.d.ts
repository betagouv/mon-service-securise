declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-indice-cyber': CustomEvent;
  }
}

export type IndiceCyberProps = {
  indiceCyber: number;
  noteMax: number;
};
