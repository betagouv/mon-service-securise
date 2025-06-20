import { derived } from 'svelte/store';
import { servicesAvecMesuresAssociees } from './servicesAvecMesuresAssociees.store';

const { subscribe } = derived<
  typeof servicesAvecMesuresAssociees,
  Record<string, string[]>
>(servicesAvecMesuresAssociees, ($servicesAvecMesuresAssociees, set) => {
  const resultat = $servicesAvecMesuresAssociees.reduce(
    (acc: Record<string, string[]>, service) => {
      Object.keys(service.mesuresAssociees).forEach((idMesure) => {
        const pourMesureExistante = acc[idMesure] || [];
        acc[idMesure] = [...pourMesureExistante, service.id];
      });
      return acc;
    },
    {}
  );
  set(resultat);
});

export const mesuresAvecServicesAssociesStore = {
  subscribe,
};
