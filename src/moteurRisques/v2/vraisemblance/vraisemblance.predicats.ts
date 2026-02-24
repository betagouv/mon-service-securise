import type { MesureAvecStatut } from './vraisemblance.types.js';

export const siTout = (mesures: MesureAvecStatut[]) =>
  mesures.every((m) => m.statut === 'fait') ? 1 : 0;

export const siAucune = (mesures: MesureAvecStatut[]) =>
  mesures.every((m) => m.statut !== 'fait') ? 1 : 0;

export const siPasTout = (mesures: MesureAvecStatut[]) =>
  !mesures.every((m) => m.statut === 'fait') ? 1 : 0;
