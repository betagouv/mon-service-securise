import type { MesureAvecStatut } from './vraisemblance.types.js';

const sansLesNonFaites = (mesures: MesureAvecStatut[]) =>
  mesures.filter((m) => m.statut !== 'nonFait');

export const siTout = (mesures: MesureAvecStatut[]) =>
  sansLesNonFaites(mesures).every((m) => m.statut === 'fait') ? 1 : 0;

export const siAucune = (mesures: MesureAvecStatut[]) =>
  sansLesNonFaites(mesures).every((m) => m.statut !== 'fait') ? 1 : 0;

export const siPasTout = (mesures: MesureAvecStatut[]) =>
  !sansLesNonFaites(mesures).every((m) => m.statut === 'fait') ? 1 : 0;
