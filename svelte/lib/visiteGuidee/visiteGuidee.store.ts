import { derived, get, writable } from 'svelte/store';
import EtapeBienvenue from './etapes/initiale/EtapeBienvenue.svelte';
import EtapePresentationMenuNavigation from './etapes/initiale/EtapePresentationMenuNavigation.svelte';
import EtapeDecrire from './etapes/decrire/EtapeDecrire.svelte';
import type { EtatVisiteGuidee, Utilisateur } from './visiteGuidee.d';
import EtapeSecuriser from './etapes/securiser/EtapeSecuriser.svelte';
import EtapeHomologuer from './etapes/homologuer/EtapeHomologuer.svelte';
import EtapePiloter from './etapes/piloter/EtapePiloter.svelte';
import {
  finaliseVisiteGuidee,
  metsEnPause,
  termineEtape,
} from './visiteGuidee.api';

const etatParDefaut: EtatVisiteGuidee = {
  etapeCourante: 'BIENVENUE',
};

const { subscribe, set } = writable<EtatVisiteGuidee>(etatParDefaut);
const { subscribe: subscribeUtilisateur, set: setUtilisateur } =
  writable<Utilisateur>();

const redirigeApresFinalisationVisite = () => {
  const ligneService = document.getElementsByClassName(
    'ligne-service'
  )[0] as HTMLElement;
  const { idService } = ligneService.dataset;
  window.location.href = get(utilisateurCourant).profilComplet
    ? '/service/creation'
    : `/service/${idService}`;
};

export const visiteGuidee = {
  initialise: (etatVisiteGuidee: EtatVisiteGuidee) => {
    set(etatVisiteGuidee.etapeCourante ? etatVisiteGuidee : etatParDefaut);
  },
  subscribe,
  async masqueEtapeCourante() {
    await metsEnPause();
    window.location.href = '/tableauDeBord';
  },
  masqueModale() {
    set({ etapeCourante: 'MASQUE' });
  },
  async fermeDefinitivementVisiteGuidee() {
    await finaliseVisiteGuidee();
    window.location.href = '/tableauDeBord';
  },
  async finalise() {
    await finaliseVisiteGuidee();
    redirigeApresFinalisationVisite();
  },
  async etapeSuivante() {
    const etat = get(visiteGuidee);
    switch (etat.etapeCourante) {
      case 'BIENVENUE':
        set({ etapeCourante: 'PRESENTATION_MENU_NAV' });
        break;
      case 'PRESENTATION_MENU_NAV':
        window.location.href = '/visiteGuidee/decrire';
        break;
      default:
        const urlEtapeSuivante = await termineEtape(etat.etapeCourante);
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
  switch ($visiteGuidee.etapeCourante) {
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
