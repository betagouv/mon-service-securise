import type { IdUtilisateur, Autorisation } from '../gestionContributeurs.d';
import { writable } from 'svelte/store';

type AutorisationsStore = {
  autorisations: Record<IdUtilisateur, Autorisation>;
};

const valeurParDefaut: AutorisationsStore = {
  autorisations: {},
};

const { subscribe, update } = writable<AutorisationsStore>(valeurParDefaut);

export const storeAutorisations = {
  subscribe,

  charge: (autorisations: Autorisation[]) => {
    const parIdUtilisateur = Object.fromEntries(
      autorisations.map((a) => [a.idUtilisateur, a])
    );
    update((etat) => ({ ...etat, autorisations: parIdUtilisateur }));
  },

  remplace: (cible: Autorisation) => {
    update((etat) => ({
      ...etat,
      autorisations: { ...etat.autorisations, [cible.idUtilisateur]: cible },
    }));
  },
};
