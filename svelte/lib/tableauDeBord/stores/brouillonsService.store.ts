import { writable } from 'svelte/store';
import type { BrouillonService } from '../tableauDeBord.d';

const { set, subscribe } = writable<BrouillonService[]>([]);

export const brouillonsService = {
  reinitialise: (brouillons: BrouillonService[]) => set(brouillons),
  subscribe,
};
