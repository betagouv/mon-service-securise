const ListeRisques = require('./listeRisques');
const RisqueSpecifique = require('./risqueSpecifique');

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

module.exports = RisquesSpecifiques;
