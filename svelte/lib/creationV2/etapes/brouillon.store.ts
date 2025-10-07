import { writable } from 'svelte/store';
import type { BrouillonSvelte, BrouillonIncomplet } from '../creationV2.types';

export const unBrouillonVierge = (): BrouillonSvelte => ({
  id: undefined,
  nomService: '',
  siret: '',
  statutDeploiement: '',
  presentation: '',
  pointsAcces: [],
  typeService: [],
  specificitesProjet: [],
  typeHebergement: '',
  activitesExternalisees: [],
  ouvertureSysteme: '',
  audienceCible: '',
  dureeDysfonctionnementAcceptable: '',
  categoriesDonneesTraitees: [],
  categoriesDonneesTraiteesSupplementaires: [],
  volumetrieDonneesTraitees: '',
  localisationsDonneesTraitees: [],
  niveauSecurite: '',
});

const { set, subscribe } = writable<BrouillonSvelte>(unBrouillonVierge());

export const leBrouillon = {
  subscribe,
  set,
  chargeDonnees: (donnees: BrouillonIncomplet) =>
    set({ ...unBrouillonVierge(), ...donnees }),
};
