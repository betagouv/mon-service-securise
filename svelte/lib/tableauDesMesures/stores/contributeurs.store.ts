import type { Contributeur } from '../tableauDesMesures.d';
import { writable } from 'svelte/store';

const { subscribe, set } = writable<Contributeur[]>([]);

export const contributeurs = {
  subscribe,
  reinitialise: (contributeurs: Contributeur[]) => set(contributeurs),
};
