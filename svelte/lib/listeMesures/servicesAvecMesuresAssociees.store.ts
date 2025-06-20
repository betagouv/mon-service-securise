import { writable } from 'svelte/store';
import type { ServiceAvecMesuresAssociees } from './listeMesures.d';

const { subscribe, set } = writable<ServiceAvecMesuresAssociees[]>([]);

export const servicesAvecMesuresAssociees = {
  subscribe,
  set,
  rafraichis: () => {
    axios
      .get<ServiceAvecMesuresAssociees[]>('/api/services/mesures')
      .then(({ data: services }) => {
        set(services);
      });
  },
};
