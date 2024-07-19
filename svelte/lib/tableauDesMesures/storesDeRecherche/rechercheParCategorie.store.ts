import { writable } from 'svelte/store';
import type {
  IdCategorie,
  MesureGenerale,
  MesureSpecifique,
} from '../tableauDesMesures.d';

export const rechercheParCategorie = writable<IdCategorie[]>([]);

export const appliqueFiltreParCategorie = (
  mesure: MesureSpecifique | MesureGenerale,
  selection: IdCategorie[]
): boolean => selection.includes(mesure.categorie);
