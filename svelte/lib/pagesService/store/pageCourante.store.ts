import { derived } from 'svelte/store';
import { pageDepuisURL } from './pageDepuisURL';
import { routeurStore } from './routeur.store';

export const pageCourante = derived(routeurStore, ($r) =>
  pageDepuisURL($r.location)
);
