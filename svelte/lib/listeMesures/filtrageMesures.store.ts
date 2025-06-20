import { writable } from 'svelte/store';

const { subscribe, set } = writable<Record<string, string[]>>({});

export const filtrageMesures = {
  subscribe,
  set,
  reinitialise: () => set({}),
};
