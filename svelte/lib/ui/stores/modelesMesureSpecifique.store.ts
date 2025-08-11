import { writable } from 'svelte/store';
import type { ModeleMesureSpecifique } from '../types';

const { subscribe, set } = writable<ModeleMesureSpecifique[]>([]);

const rafraichis = async () =>
  axios
    .get<ModeleMesureSpecifique[]>('/api/modeles/mesureSpecifique')
    .then(({ data: modelesMesureSpecifique }) => set(modelesMesureSpecifique));

rafraichis();

export const modelesMesureSpecifique = {
  subscribe,
  rafraichis,
};
