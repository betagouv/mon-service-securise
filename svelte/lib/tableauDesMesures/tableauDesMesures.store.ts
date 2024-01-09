import { writable } from 'svelte/store';
import type { Mesures } from './tableauDesMesures.d';

const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const { subscribe, set } = writable<Mesures>(mesuresParDefaut());

export const store = {
  set,
  subscribe,
  reinitialise: (mesures?: Mesures) => set(mesures ?? mesuresParDefaut()),
};
