import donneesReferentiel from './donneesReferentiel.js';

export type StatutMesure = keyof (typeof donneesReferentiel)['statutsMesures'];
export type PrioriteMesure =
  keyof (typeof donneesReferentiel)['prioritesMesures'];
