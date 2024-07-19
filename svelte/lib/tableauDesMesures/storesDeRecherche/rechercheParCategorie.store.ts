import { writable } from 'svelte/store';
import type { IdCategorie } from '../tableauDesMesures.d';

export const rechercheParCategorie = writable<IdCategorie[]>([]);
