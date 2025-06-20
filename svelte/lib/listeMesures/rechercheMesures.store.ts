import { writable } from 'svelte/store';

const { subscribe, set } = writable<string>('');

export const rechercheMesures = {
  subscribe,
  set,
  reinitialise: () => set(''),
};
