import { writable } from 'svelte/store';
import type {
  IdCategorie,
  MesureGenerale,
  MesureSpecifique,
} from '../tableauDesMesures.d';

export const thematiques = [
  'Gouvernance et gestion des risques',
  "Gestion de l'écosystème",
  'Sécurité applicative et protection des données',
  'Gestion des identités et des accès',
  'Surveillance, maintien et réponse aux incidents',
  'Protection des systèmes et réseaux',
] as const;

export type IdThematique = (typeof thematiques)[number];

export const rechercheParThematique = writable<IdThematique[]>([]);

export const appliqueFiltreParThematique = (
  mesure: MesureSpecifique | MesureGenerale,
  selection: IdThematique[]
): boolean => selection.includes(mesure.thematique);
