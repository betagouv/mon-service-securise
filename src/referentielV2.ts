import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';
import { IdMesureV2 } from './moteurRegles/v2/moteurReglesV2.js';

export type DonneesReferentielV2 = {
  mesures: typeof mesuresV2;
};

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { mesures: mesuresV2 }
): Referentiel => {
  const mesure = (idMesure: IdMesureV2) => donnees.mesures[idMesure];
  return {
    ...creeReferentiel(),
    mesure,
    version: () => 'v2',
  };
};
