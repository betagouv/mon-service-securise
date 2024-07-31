import { writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';
import type { PrioriteMesure } from '../../ui/types.d';

export const rechercheParPriorite = writable<PrioriteMesure[]>([]);

export const appliqueFiltreParPriorite = (
  mesure: MesureSpecifique | MesureGenerale,
  selection: PrioriteMesure[]
): boolean => !!mesure.priorite && selection.includes(mesure.priorite);
