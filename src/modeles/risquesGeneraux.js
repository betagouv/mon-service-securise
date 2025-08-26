import ListeRisques from './listeRisques.js';
import RisqueGeneral from './risqueGeneral.js';

class RisquesGeneraux extends ListeRisques {
  constructor(donnees, referentiel) {
    const { risquesGeneraux } = donnees;
    super(RisqueGeneral, { items: risquesGeneraux }, referentiel);
  }
}

export default RisquesGeneraux;
