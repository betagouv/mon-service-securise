import { writable } from 'svelte/store';
import type { IndiceCyber, ServiceAvecIndiceCyber } from '../tableauDeBord.d';

const { set, subscribe, update } = writable<ServiceAvecIndiceCyber[]>([]);

export const services = {
  reinitialise: (services: ServiceAvecIndiceCyber[]) => set(services),
  ajouteIndicesCyber: (indicesCybers: IndiceCyber[]) => {
    update((services: ServiceAvecIndiceCyber[]) => {
      return services.map((service) => {
        const indiceCyberDuService = indicesCybers.find(
          (i) => i.id === service.id
        );
        return {
          ...service,
          ...(indiceCyberDuService && {
            indiceCyber: parseFloat(indiceCyberDuService.indiceCyber),
          }),
        };
      });
    });
  },
  subscribe,
};
