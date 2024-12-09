import { writable } from 'svelte/store';

const { set, subscribe } = writable<string[]>([]);
export const selectionIdsServices = {
  subscribe,
  set,
  vide: () => set([]),
};
