import { writable } from 'svelte/store';
import type { Service } from '../tableauDeBord.d';

export const rechercheTextuelle = writable<string>('');

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

export const appliqueFiltreTextuel = (service: Service, valeur: string) =>
  contientEnMinuscule(service.nomService, valeur) ||
  contientEnMinuscule(service.organisationResponsable, valeur);
