import ListeRisques from './listeRisques.js';
import RisqueSpecifique from './risqueSpecifique.js';

class RisquesSpecifiques extends ListeRisques {
  constructor(donnees, referentiel) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques }, referentiel);
  }

  metsAJourRisque(risque) {
    const risqueExistant = this.trouveParId(risque.id);
    risque.identifiantNumerique = risqueExistant.identifiantNumerique;
    super.metsAJourRisque(risque);
  }
}

export default RisquesSpecifiques;
