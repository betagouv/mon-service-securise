import { derived } from 'svelte/store';
import { leBrouillon } from './etapes/brouillon.store';

export const brouillonAEteCreeStore = derived<[typeof leBrouillon], boolean>(
  [leBrouillon],
  ([$b]) => !!$b.id
);
