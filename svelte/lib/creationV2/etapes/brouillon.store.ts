import { writable } from 'svelte/store';
import type { BrouillonSvelte, BrouillonIncomplet } from '../creationV2.types';

export const unBrouillonVierge = (): BrouillonSvelte => ({
  nomService: '',
  siret: '',
  statutDeploiement: '',
  presentation: '',
  pointsAcces: [],
  typeService: [],
  specificitesProjet: [],
  typeHebergement: '',
  activitesExternalisees: [],
});

const { set, subscribe } = writable<BrouillonSvelte>(unBrouillonVierge());

export const leBrouillon = {
  subscribe,
  set,
  chargeDonnees: (donnees: BrouillonIncomplet) =>
    set({ ...unBrouillonVierge(), ...donnees }),
};
