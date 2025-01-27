import { writable } from 'svelte/store';
import type {
  ServiceAvecIndiceCyber,
  NiveauSecuriteService,
} from '../tableauDeBord.d';

export type FiltreIndiceCyber = '<1' | '1-2' | '2-3' | '3-4' | '4-5';
export type FiltrePropriete = 'proprietaire';
export type OptionsDeFiltrage = {
  indiceCyber: FiltreIndiceCyber[];
  propriete: FiltrePropriete[];
  niveauSecurite: NiveauSecuriteService[];
  completude: FiltreCompletude[];
};
export type FiltreCompletude = '<50%' | '50%-80%' | '>80%';

export const filtrageServicesVide = {
  indiceCyber: [],
  propriete: [],
  niveauSecurite: [],
  completude: [],
};
export const filtrageServices = writable<OptionsDeFiltrage>({
  ...filtrageServicesVide,
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

export const appliqueFiltrageParNiveauDeSecurite = (
  service: ServiceAvecIndiceCyber,
  filtres: NiveauSecuriteService[]
) =>
  service.niveauSecurite ? filtres.includes(service.niveauSecurite) : false;

export const appliqueFiltrageParCompletude = (
  service: ServiceAvecIndiceCyber,
  filtres: FiltreCompletude[]
) => {
  if (service.pourcentageCompletude === undefined) return false;

  if (filtres.includes('<50%') && service.pourcentageCompletude < 0.5)
    return true;
  if (
    filtres.includes('50%-80%') &&
    service.pourcentageCompletude >= 0.5 &&
    service.pourcentageCompletude <= 0.8
  )
    return true;
  if (filtres.includes('>80%') && service.pourcentageCompletude > 0.8)
    return true;

  return false;
};
