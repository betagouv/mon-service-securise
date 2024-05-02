import { writable, derived, get } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';
import EtapeDecrire from './etapes/decrire/EtapeDecrire.svelte';
import type { EtapeVisiteGuidee, Utilisateur } from './visiteGuidee.d';
import EtapeSecuriser from './etapes/securiser/EtapeSecuriser.svelte';
import EtapeHomologuer from './etapes/homologuer/EtapeHomologuer.svelte';
import EtapePiloter from './etapes/piloter/EtapePiloter.svelte';
import {
  finaliseVisiteGuidee,
  metsEnPause,
  termineEtape,
} from './visiteGuidee.api';

const { subscribe, set } = writable<EtapeVisiteGuidee>('BIENVENUE');
const { subscribe: subscribeUtilisateur, set: setUtilisateur } =
  writable<Utilisateur>();

export const visiteGuidee = {
  initialise: (etapeCourante: EtapeVisiteGuidee) =>
    set(etapeCourante || 'BIENVENUE'),
  subscribe,
  async masqueEtapeCourante() {
    await metsEnPause();
    window.location.href = '/tableauDeBord';
  },
  masqueModale() {
    set('MASQUE');
  },
  async fermeDefinitivementVisiteGuidee() {
    await finaliseVisiteGuidee();
    window.location.href = '/tableauDeBord';
  },
  async finalise() {
    await finaliseVisiteGuidee();
    window.location.href = '/service/creation';
  },
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

export const utilisateurCourant = {
  subscribe: subscribeUtilisateur,
  initialise: (utilisateur: Utilisateur) => setUtilisateur(utilisateur),
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
    case 'MASQUE':
      return null;
  }
});
