import MesureGenerale from '../../modeles/mesureGenerale.js';

export const siTout = (mesures: MesureGenerale[]) =>
  mesures.every((m) => m.statut === 'fait') ? 1 : 0;

export const siAucune = (mesures: MesureGenerale[]) =>
  mesures.every((m) => m.statut !== 'fait') ? 1 : 0;
