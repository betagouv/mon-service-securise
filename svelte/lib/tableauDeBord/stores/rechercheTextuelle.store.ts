import { writable } from 'svelte/store';
import type { ServiceAvecIndiceCyber } from '../tableauDeBord.d';

export const rechercheTextuelle = writable<string>('');

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

export const appliqueFiltreTextuel = (
  service: ServiceAvecIndiceCyber,
  valeur: string
) =>
  contientEnMinuscule(service.nomService, valeur) ||
  contientEnMinuscule(service.organisationResponsable, valeur);
