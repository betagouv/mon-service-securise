import ListeRisques from './listeRisques.js';
import RisqueGeneral, { DonneesRisqueGeneral } from './risqueGeneral.js';
import { Referentiel } from '../referentiel.interface.js';

type DonneesRisquesGeneraux = {
  risquesGeneraux: DonneesRisqueGeneral[];
};

class RisquesGeneraux extends ListeRisques<RisqueGeneral> {
  constructor(donnees: DonneesRisquesGeneraux, referentiel: Referentiel) {
    const { risquesGeneraux } = donnees;
    super(RisqueGeneral, { items: risquesGeneraux }, referentiel);
  }
}

export default RisquesGeneraux;
