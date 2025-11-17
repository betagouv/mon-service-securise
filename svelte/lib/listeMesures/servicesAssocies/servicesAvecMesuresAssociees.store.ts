import { writable } from 'svelte/store';
import type { ServiceAvecMesuresAssociees } from '../listeMesures.d';

const { subscribe, set } = writable<ServiceAvecMesuresAssociees[]>([]);

const { set: setEnCoursDeChargement, subscribe: subscribeEnCoursDeChargement } =
  writable<boolean>(false);

export const servicesAvecMesuresAssociees = {
  subscribe,
  set,
  rafraichis: async () => {
    try {
      setEnCoursDeChargement(true);
      const { data: services } = await axios.get<ServiceAvecMesuresAssociees[]>(
        '/api/services/mesures'
      );
      set(services);
    } finally {
      setEnCoursDeChargement(false);
    }
  },
};

export const servicesAvecMesuresAssocieesEnCoursDeChargement = {
  subscribe: subscribeEnCoursDeChargement,
};
