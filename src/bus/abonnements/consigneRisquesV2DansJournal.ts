/* eslint-disable no-console */
import { EvenementRisquesV2ServiceModifies } from '../evenementRisquesV2ServiceModifies.js';

export function consigneRisquesV2DansJournal() {
  return async (evenement: EvenementRisquesV2ServiceModifies) => {
    console.log(
      '📝 ÉCRITURE DES RISQUES V2 MODIFIÉS DANS LE JOURNAL : ',
      evenement
    );
  };
}
