import { writable, derived } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';

type EtapeVisiteGuidee = 'BIENVENUE' | 'PRESENTATION_MENU_NAV';

const { subscribe, set, update } = writable<EtapeVisiteGuidee>('BIENVENUE');

export const visiteGuidee = {
  subscribe,
  cacheRideau: () =>
    (document.getElementById('visite-guidee')!.style.display = 'none'),
  etapeSuivante() {
    update((etapeCourante) => {
      switch (etapeCourante) {
        case 'BIENVENUE':
          return 'PRESENTATION_MENU_NAV';
        default:
          return 'BIENVENUE';
      }
    });
  },
};

export const composantVisiteGuidee = derived(visiteGuidee, ($visiteGuidee) => {
  switch ($visiteGuidee) {
    case 'BIENVENUE':
      return EtapeBienvenue;
    case 'PRESENTATION_MENU_NAV':
      return EtapePresentationMenuNavigation;
  }
});
