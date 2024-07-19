import { writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';

export const rechercheTextuelle = writable<string>('');

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

export const appliqueFiltreTextuel = (
  mesure: MesureSpecifique | MesureGenerale,
  valeur: string
) =>
  contientEnMinuscule(mesure.description, valeur) ||
  contientEnMinuscule((mesure as MesureGenerale).descriptionLongue, valeur) ||
  contientEnMinuscule(mesure.identifiantNumerique, valeur);
