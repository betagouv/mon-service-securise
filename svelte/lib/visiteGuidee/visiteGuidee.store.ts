import { writable, derived } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';
import EtapeDecrire from './etapes/decrire/EtapeDecrire.svelte';

type EtapeVisiteGuidee = 'BIENVENUE' | 'PRESENTATION_MENU_NAV' | 'DECRIRE';

const { subscribe, update } = writable<EtapeVisiteGuidee>('BIENVENUE');

const cacheRideau = () => {
  document.body.style.overflow = 'auto';
  document.getElementById('visite-guidee')!.style.display = 'none';
};

export const visiteGuidee = {
  subscribe,
  masqueEtapeCourant: () => cacheRideau(),
  fermeDefinitivementVisiteGuidee: () => cacheRideau(),
  etapeSuivante() {
    update((etapeCourante) => {
      switch (etapeCourante) {
        case 'BIENVENUE':
          return 'PRESENTATION_MENU_NAV';
        case 'PRESENTATION_MENU_NAV':
          window.location.href = '/visiteGuidee/decrire';
          return 'DECRIRE';
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
    case 'DECRIRE':
      return EtapeDecrire;
  }
});
