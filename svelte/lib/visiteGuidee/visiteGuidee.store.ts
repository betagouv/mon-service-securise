import { writable, derived, get } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';
import EtapeDecrire from './etapes/decrire/EtapeDecrire.svelte';
import type { EtapeVisiteGuidee } from './visiteGuidee.d';
import EtapeSecuriser from './etapes/securiser/EtapeSecuriser.svelte';
import EtapeHomologuer from './etapes/homologuer/EtapeHomologuer.svelte';
import EtapePiloter from './etapes/piloter/EtapePiloter.svelte';
import { termineEtape } from './visiteGuidee.api';

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
  finalise: () => (window.location.href = '/service/creation'),
  async etapeSuivante() {
    const etapeCourante = get(visiteGuidee);
    switch (etapeCourante) {
      case 'BIENVENUE':
        set('PRESENTATION_MENU_NAV');
        break;
      case 'PRESENTATION_MENU_NAV':
        window.location.href = '/visiteGuidee/decrire';
        break;
      default:
        const urlEtapeSuivante = await termineEtape(etapeCourante);
        if (urlEtapeSuivante) {
          window.location.href = urlEtapeSuivante;
        }
        break;
    }
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
    case 'PILOTER':
      return EtapePiloter;
  }
});
