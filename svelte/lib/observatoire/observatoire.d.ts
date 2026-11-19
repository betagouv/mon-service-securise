declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-observatoire': CustomEvent;
  }
}

export type CumulMensuelServices = {
  mois: string;
  cumul: number;
};

export type MesuresFaitesParMois = {
  mois: string;
  total: number;
};

export type ObservatoireProps = {
  totalServices: number;
  cumulMensuelServices: CumulMensuelServices[];
  mesuresFaitesParMois: MesuresFaitesParMois[];
};
