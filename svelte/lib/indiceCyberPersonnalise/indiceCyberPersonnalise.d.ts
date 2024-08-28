declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-indice-cyber-personnalise': CustomEvent;
  }
}

export type IndiceCyberPersonnaliseProps = {
  indiceCyberPersonnalise: number;
  noteMax: number;
};
