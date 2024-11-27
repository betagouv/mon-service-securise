import { writable } from 'svelte/store';
import type { Service } from '../tableauDeBord.d';

const { set, subscribe, update } = writable<Service[]>([]);

export const services = {
  reinitialise: (services: Service[]) => set(services),
  subscribe,
};
