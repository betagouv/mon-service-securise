import donneesReferentiel from './donneesReferentiel.js';

export type StatutMesure = keyof (typeof donneesReferentiel)['statutsMesures'];
export type PrioriteMesure =
  keyof (typeof donneesReferentiel)['prioritesMesures'];
export type IdMesure = keyof (typeof donneesReferentiel)['mesures'];
