import { writable } from 'svelte/store';
import type { ServiceAvecMesuresAssociees } from '../listeMesures.d';

const { subscribe, set } = writable<ServiceAvecMesuresAssociees[]>([]);

const { set: setEnCoursDeChargement, subscribe: subscribeEnCoursDeChargement } =
  writable<boolean>(false);

export const servicesAvecMesuresAssociees = {
  subscribe,
  set,
  rafraichis: () => {
    setEnCoursDeChargement(true);
    axios
      .get<ServiceAvecMesuresAssociees[]>('/api/services/mesures')
      .then(({ data: services }) => {
        set(services);
      })
      .finally(() => setEnCoursDeChargement(false));
  },
};

export const servicesAvecMesuresAssocieesEnCoursDeChargement = {
  subscribe: subscribeEnCoursDeChargement,
};
