import { get, writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';
import { utilisateurCourant } from './contributeurs.store';

export const rechercheMesMesures = writable<boolean>(false);

export const appliqueFiltreMesMesures = (
  mesure: MesureGenerale | MesureSpecifique
) => {
  let idUtilisateurCourant = get(utilisateurCourant).id;
  return mesure.responsables?.includes(idUtilisateurCourant) || false;
};
