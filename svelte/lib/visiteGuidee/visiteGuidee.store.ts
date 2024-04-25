import { writable, derived } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';
import EtapeDecrire from './etapes/decrire/EtapeDecrire.svelte';
import type { EtapeVisiteGuidee } from './visiteGuidee.d';
import EtapeSecuriser from './etapes/securiser/EtapeSecuriser.svelte';
import EtapeHomologuer from './etapes/homologuer/EtapeHomologuer.svelte';

const { subscribe, update, set } = writable<EtapeVisiteGuidee>('BIENVENUE');

const cacheRideau = () => {
  document.body.style.overflow = 'auto';
  document.getElementById('visite-guidee-rideau')!.style.display = 'none';
  document.getElementById('visite-guidee')!.style.display = 'none';
};

export const visiteGuidee = {
  initialise: (etapeCourante: EtapeVisiteGuidee) =>
    set(etapeCourante || 'BIENVENUE'),
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
        case 'DECRIRE':
          window.location.href = '/visiteGuidee/securiser';
          return 'SECURISER';
        case 'SECURISER':
          window.location.href = '/visiteGuidee/homologuer';
          return 'HOMOLOGUER';
        case 'HOMOLOGUER':
          return 'HOMOLOGUER';
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
    case 'SECURISER':
      return EtapeSecuriser;
    case 'HOMOLOGUER':
      return EtapeHomologuer;
  }
});
