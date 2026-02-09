import { writable } from 'svelte/store';
import type {
  MesureGenerale,
  MesureSpecifique,
  PartieResponsable,
} from '../tableauDesMesures.d';

export const rechercheParPartieResponsable = writable<PartieResponsable[]>([]);

export const appliqueFiltrePartieResponsable = (
  mesure: MesureGenerale | MesureSpecifique,
  selection: PartieResponsable[]
) =>
  mesure.partieResponsable !== undefined &&
  selection.includes(mesure.partieResponsable);
