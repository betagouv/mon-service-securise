import { writable } from 'svelte/store';
import type { ServiceAvecIndiceCyber } from '../tableauDeBord.d';

export type FiltreIndiceCyber = '<1' | '1-2' | '2-3' | '3-4' | '4-5';
export type FiltrePropriete = 'proprietaire';
export type OptionsDeFiltrage = {
  indiceCyber: FiltreIndiceCyber[];
  propriete: FiltrePropriete[];
};

export const filtrageServices = writable<OptionsDeFiltrage>({
  indiceCyber: [],
  propriete: [],
});

const entreBornes = (
  nombre: number,
  borneBasse: number,
  borneHauteIncluse: number
) => nombre > borneBasse && nombre <= borneHauteIncluse;

export const appliqueFiltrageParIndiceCyber = (
  service: ServiceAvecIndiceCyber,
  filtres: FiltreIndiceCyber[]
) => {
  if (service.indiceCyber === undefined) return false;

  if (filtres.includes('<1') && service.indiceCyber <= 1) return true;
  if (filtres.includes('1-2') && entreBornes(service.indiceCyber, 1, 2))
    return true;
  if (filtres.includes('2-3') && entreBornes(service.indiceCyber, 2, 3))
    return true;
  if (filtres.includes('3-4') && entreBornes(service.indiceCyber, 3, 4))
    return true;
  if (filtres.includes('4-5') && entreBornes(service.indiceCyber, 4, 5))
    return true;

  return false;
};

export const appliqueFiltrageParProprietaire = (
  service: ServiceAvecIndiceCyber,
  filtres: FiltrePropriete[]
) => {
  if (filtres.includes('proprietaire')) return service.estProprietaire;
  return true;
};
