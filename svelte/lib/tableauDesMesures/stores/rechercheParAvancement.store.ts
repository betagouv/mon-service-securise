import { writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';

export type Avancement = 'statutADefinir' | 'enAction' | 'traite' | 'toutes';

export const rechercheParAvancement = writable<Avancement>('statutADefinir');

export const appliqueFiltreAvancement = (
  mesure: MesureSpecifique | MesureGenerale,
  valeur: Avancement
): boolean => {
  if (valeur === 'statutADefinir') return !mesure.statut;

  if (valeur === 'enAction')
    return mesure.statut === 'aLancer' || mesure.statut === 'enCours';

  if (valeur === 'traite')
    return mesure.statut === 'fait' || mesure.statut === 'nonFait';

  return true;
};
