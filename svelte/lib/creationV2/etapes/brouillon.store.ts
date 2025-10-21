import { writable } from 'svelte/store';
import type {
  BrouillonServiceV2,
  BrouillonIncomplet,
} from '../creationV2.types';
import type { Entite } from '../../ui/types.d';

export const unBrouillonVierge = (): BrouillonServiceV2 => ({
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

const { set, subscribe } = writable<BrouillonServiceV2>(unBrouillonVierge());

export const leBrouillon = {
  subscribe,
  set,
  chargeDonnees: (donnees: BrouillonIncomplet) =>
    set({ ...unBrouillonVierge(), ...donnees }),
};

export const entiteDeUtilisateur = writable<Entite | undefined>();
