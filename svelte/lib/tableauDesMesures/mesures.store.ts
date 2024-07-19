import type { Mesures } from './tableauDesMesures.d';
import { writable } from 'svelte/store';

export const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const toutesLesMesures = writable<Mesures>(mesuresParDefaut());

export const mesures = {
  set: toutesLesMesures.set,
  subscribe: toutesLesMesures.subscribe,
  reinitialise: (mesures?: Mesures) =>
    toutesLesMesures.set(mesures ?? mesuresParDefaut()),
  metAJourStatutMesureGenerale: (idMesure: string, statut: string) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresGenerales[idMesure].statut = statut;
      return valeur;
    }),
  metAJourStatutMesureSpecifique: (idMesure: number, statut: string) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].statut = statut;
      return valeur;
    }),
};
