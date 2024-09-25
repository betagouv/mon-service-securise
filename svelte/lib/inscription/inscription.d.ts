declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-inscription': CustomEvent;
  }
}

export type EstimationNombreServices = {
  label: string;
  borneBasse: number;
  borneHaute: number;
};

export type InscriptionProps = {
  estimationNombreServices: EstimationNombreServices[];
};
