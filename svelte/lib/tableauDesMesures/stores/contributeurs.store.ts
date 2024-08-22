import type { Contributeur } from '../tableauDesMesures.d';
import { derived, writable } from 'svelte/store';

const { subscribe, set } = writable<Contributeur[]>([]);

export const contributeurs = {
  subscribe,
  reinitialise: (contributeurs: Contributeur[]) => set(contributeurs),
  idUtilisateurCourant() {},
};

export const utilisateurCourant = derived<typeof contributeurs, Contributeur>(
  contributeurs,
  ($contributeurs) => $contributeurs.find((c) => c.estUtilisateurCourant)!
);
