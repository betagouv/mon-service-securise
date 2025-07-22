import { writable } from 'svelte/store';
import type { ModeleMesureSpecifique } from '../../ui/types';

const { subscribe, set } = writable<ModeleMesureSpecifique[]>([]);

axios
  .get<ModeleMesureSpecifique[]>('/api/modeles/mesureSpecifique')
  .then(({ data: modelesMesureSpecifique }) => set(modelesMesureSpecifique));

export const modelesMesureSpecifique = {
  subscribe,
};
